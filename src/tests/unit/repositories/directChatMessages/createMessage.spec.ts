import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { QueryBuilderMock, users, directChats, directChatsMessages } from '@testMocks';

import { DirectChatMessagesRepository } from '@repositories';

import { UserDto } from '@dtos/users';

import { TransformHelper } from '@helpers';

import { DirectChat, DirectChatMessage } from '@entities';

describe('Direct chat messages repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let directChatMessagesRepository: DirectChatMessagesRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: DataSource, useValue: queryBuilderMock },
				DirectChatMessagesRepository,
			],
		}).compile();

		directChatMessagesRepository = moduleFixture.get(DirectChatMessagesRepository);
	});

	describe('Create message', (): void => {
		const senderMock: UserDto = TransformHelper.toTargetDto(UserDto, users[3]);
		const directChatMock: DirectChat = directChats[1];
		const messageTextMock: string = 'Hello, Bruce';
		const messageDateTimeMock: string = '2025-04-05 23:50:35';

		const expectedMessage: DirectChatMessage = directChatsMessages[0];

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue({ identifiers: [{ id: expectedMessage.id }] });
			queryBuilderMock.getOne.mockReturnValue(expectedMessage);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a query to insert a new message', async (): Promise<void> => {
			await directChatMessagesRepository.createMessage(
				senderMock,
				directChatMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(1, DirectChatMessage);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(1, {
				dateTime: messageDateTimeMock,
				messageText: messageTextMock,
				directChat: directChatMock,
				sender: senderMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should use query builder and create a query to retrieve a created message', async (): Promise<void> => {
			await directChatMessagesRepository.createMessage(
				senderMock,
				directChatMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'direct_chat_message');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'direct_chat_message',
			);

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'direct_chat_message.directChat',
				'directChat',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'direct_chat_message.sender',
				'sender',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				3,
				'directChat.users',
				'direct_chat_users',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'direct_chat_message.id = :id', {
				id: expectedMessage.id,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should use a transaction to rollback changes in case of any error', async (): Promise<void> => {
			await directChatMessagesRepository.createMessage(
				senderMock,
				directChatMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return a message if it was successfully created', async (): Promise<void> => {
			const message: DirectChatMessage | null = await directChatMessagesRepository.createMessage(
				senderMock,
				directChatMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(message).toEqual(expectedMessage);
		});

		it('should return null if failed to retrieve created message', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const message: DirectChatMessage | null = await directChatMessagesRepository.createMessage(
				senderMock,
				directChatMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(message).toBeNull();
		});
	});
});
