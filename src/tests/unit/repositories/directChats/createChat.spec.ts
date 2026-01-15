import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, InsertResult } from 'typeorm';

import { QueryBuilderMock, users, directChats } from '@testMocks';

import { DirectChatsRepository } from '@repositories';

import { UserDto } from '@dtos/users';

import { TransformHelper } from '@helpers';

import { DirectChat, DirectChatMessage } from '@entities';

describe('Direct chats repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let directChatsRepository: DirectChatsRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, DirectChatsRepository],
		}).compile();

		directChatsRepository = moduleFixture.get(DirectChatsRepository);
	});

	describe('Create chat', (): void => {
		const expectedChat: DirectChat = directChats[3];

		const chatInsertResultMock: InsertResult = {
			generatedMaps: [{ id: expectedChat.id }],
			raw: [],
			identifiers: [],
		};

		const senderMock: UserDto = TransformHelper.toTargetDto(UserDto, users[4]);
		const receiverMock: UserDto = TransformHelper.toTargetDto(UserDto, users[5]);

		const messageTextMock: string = "I'm an Iron Man";
		const messageDateTimeMock: string = '2025-04-08 23:38:10';
		const subQueryMock: string = 'subQueryMock';

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue(chatInsertResultMock);
			queryBuilderMock.getQuery.mockReturnValue(subQueryMock);
			queryBuilderMock.getOne.mockReturnValue(expectedChat);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and insert empty direct chat', async (): Promise<void> => {
			await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(6);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(1, DirectChat);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(1, {});

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and create a query for creating relation of sender and receiver with created chat', async (): Promise<void> => {
			await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(6);

			expect(queryBuilderMock.relation).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.relation).toHaveBeenNthCalledWith(1, DirectChat, 'users');
			expect(queryBuilderMock.relation).toHaveBeenNthCalledWith(2, DirectChat, 'users');

			expect(queryBuilderMock.of).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.of).toHaveBeenNthCalledWith(1, chatInsertResultMock.generatedMaps[0]);
			expect(queryBuilderMock.of).toHaveBeenNthCalledWith(2, chatInsertResultMock.generatedMaps[0]);

			expect(queryBuilderMock.add).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.add).toHaveBeenNthCalledWith(1, senderMock);
			expect(queryBuilderMock.add).toHaveBeenNthCalledWith(2, receiverMock);
		});

		it('should use query builder and insert initial message into created chat', async (): Promise<void> => {
			await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(6);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(2, DirectChatMessage);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(2, {
				dateTime: messageDateTimeMock,
				messageText: messageTextMock,
				directChat: chatInsertResultMock.generatedMaps[0],
				sender: senderMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder to create a sub-query for retrieving last chat message', async (): Promise<void> => {
			await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(6);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'direct_chat_message.id');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'direct_chat_message',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'direct_chat_message.direct_chat_id = direct_chat.id',
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'direct_chat_message.updated_at',
				'DESC',
			);

			expect(queryBuilderMock.limit).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.limit).toHaveBeenNthCalledWith(1, 1);

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(1);
		});

		it('should use query builder and retrieve created chat with last message and users', async (): Promise<void> => {
			await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(6);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, 'direct_chat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(2, DirectChat, 'direct_chat');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'direct_chat.users',
				'users',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'last_message.sender',
				'sender',
			);

			expect(queryBuilderMock.leftJoinAndMapMany).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndMapMany).toHaveBeenNthCalledWith(
				1,
				'direct_chat.messages',
				DirectChatMessage,
				'last_message',
				`last_message.id = (${subQueryMock})`,
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'direct_chat.id = :id', {
				id: chatInsertResultMock.generatedMaps[0].id,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should use a transaction to rollback all changes in case of any error', async (): Promise<void> => {
			await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(queryBuilderMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should return direct chat if it was successfully created', async (): Promise<void> => {
			const chat: DirectChat | null = await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(chat).toEqual(expectedChat);
		});

		it('should return null if failed to create a direct chat', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const chat: DirectChat | null = await directChatsRepository.createChat(
				senderMock,
				receiverMock,
				messageTextMock,
				messageDateTimeMock,
			);

			expect(chat).toBeNull();
		});
	});
});
