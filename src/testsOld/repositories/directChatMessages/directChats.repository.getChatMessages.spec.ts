import { directChats } from '@testMocks/DirectChat/directChats';
import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DirectChatMessagesRepository } from '@repositories/directChatMessages/directChatMessages.repository';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { users } from '@testMocks/User/users';
import { DataSource } from 'typeorm';
import { UnprocessableEntityException } from '@nestjs/common';

describe.skip('directChatsRepository', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let directChatMessagesRepository: DirectChatMessagesRepository;

	const directChatsMessagesMock: DirectChatMessage[] = [...directChatsMessages];

	const directChatIdMock: string = directChats[0].id;
	const userIdMock: string = users[2].id;
	const wrongUserIdMock: string = users[3].id;

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock();

		queryBuilderMock.getMany.mockImplementation(() => {
			const messages: DirectChatMessage[] = directChatsMessagesMock.filter(
				(directChatsMessages: DirectChatMessage) =>
					directChatsMessages.directChat.id === directChatIdMock,
			);

			messages.forEach((message: DirectChatMessage) => (message.directChat.users = [users[2]]));

			return messages;
		});

		const dataSourceMock: jest.Mocked<Partial<DataSource>> = queryBuilderMock;

		directChatMessagesRepository = new DirectChatMessagesRepository(dataSourceMock as DataSource);
	});

	describe('getChatMessages', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatMessagesRepository.getChatMessages).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatMessagesRepository.getChatMessages).toBeInstanceOf(Function);
		});

		it('should create query for retrieving last direct chat messages', async (): Promise<void> => {
			const skip: number = 0;
			const take: number = 10;

			await directChatMessagesRepository.getChatMessages(userIdMock, directChatIdMock, skip, take);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'directChatMessage');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'directChatMessage',
			);

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChat',
				'directChat',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'directChat.users',
				'directChatUsers',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				3,
				'directChatMessage.sender',
				'sender',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChatId = :directChatId',
				{ directChatId: directChatIdMock },
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.createdAt',
				'DESC',
			);

			expect(queryBuilderMock.skip).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.skip).toHaveBeenNthCalledWith(1, skip);

			expect(queryBuilderMock.take).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.take).toHaveBeenNthCalledWith(1, take);

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
		});

		it('should return array of DirectChatMessage', async (): Promise<void> => {
			const messages: DirectChatMessage[] = await directChatMessagesRepository.getChatMessages(
				userIdMock,
				directChatIdMock,
				0,
				10,
			);

			expect(messages).toBeInstanceOf(Array);

			for (const message of messages) {
				expect(message).toBeInstanceOf(DirectChatMessage);
			}
		});

		it('should throw UnprocessableEntityException if chat is not belongs to user', async (): Promise<void> => {
			await expect(
				directChatMessagesRepository.getChatMessages(wrongUserIdMock, directChatIdMock, 0, 10),
			).rejects.toThrow(UnprocessableEntityException);
		});
	});
});
