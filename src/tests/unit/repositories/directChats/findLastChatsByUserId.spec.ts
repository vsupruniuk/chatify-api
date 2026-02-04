import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { QueryBuilderMock, users, directChats } from '@testMocks';

import { DirectChatsRepository } from '@repositories';

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

	describe('Find last chats by user id', (): void => {
		const expectedChats: DirectChat[] = directChats.slice(1, 4);
		const userIdMock: string = users[5].id;
		const subQueryMock: string = 'subQueryMock';
		const skipMock: number = 10;
		const takeMock: number = 10;

		beforeEach((): void => {
			queryBuilderMock.getQuery.mockReturnValue(subQueryMock);
			queryBuilderMock.getMany.mockReturnValue(expectedChats);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a sub-query for retrieving last chat message', async (): Promise<void> => {
			await directChatsRepository.findLastChatsByUserId(userIdMock, skipMock, takeMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'direct_chat_message.id');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'direct_chat_message',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'direct_chat_message.direct_chat_id = direct_chat.id',
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'direct_chat_message.updated_at',
				'DESC',
			);

			expect(queryBuilderMock.limit).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.limit).toHaveBeenNthCalledWith(1, 1);

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and create a sub-query for filtering direct chats that belong only to the user', async (): Promise<void> => {
			await directChatsRepository.findLastChatsByUserId(userIdMock, skipMock, takeMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(
				2,
				'direct_chats_users.direct_chat_id',
			);

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				2,
				'direct_chats_users',
				'direct_chats_users',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				2,
				'direct_chats_users.user_id = :userId',
			);

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(2);
		});

		it('should use query builder and create a query for searching user last chats with last message', async (): Promise<void> => {
			await directChatsRepository.findLastChatsByUserId(userIdMock, skipMock, takeMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(3, 'direct_chat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(3, DirectChat, 'direct_chat');

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

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				3,
				`direct_chat.id IN (${subQueryMock})`,
			);

			expect(queryBuilderMock.setParameters).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.setParameters).toHaveBeenNthCalledWith(1, { userId: userIdMock });

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(2, 'last_message.updatedAt', 'DESC');

			expect(queryBuilderMock.skip).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.skip).toHaveBeenNthCalledWith(1, skipMock);

			expect(queryBuilderMock.take).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.take).toHaveBeenNthCalledWith(1, takeMock);

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
		});

		it('should return an empty array if no relevant chats was found', async (): Promise<void> => {
			queryBuilderMock.getMany.mockReturnValue([]);

			const chats: DirectChat[] = await directChatsRepository.findLastChatsByUserId(
				userIdMock,
				skipMock,
				takeMock,
			);

			expect(chats).toHaveLength(0);
		});

		it('should return all found relevant chats', async (): Promise<void> => {
			const chats: DirectChat[] = await directChatsRepository.findLastChatsByUserId(
				userIdMock,
				skipMock,
				takeMock,
			);

			const actual = chats.sort((firstChat, secondChat) =>
				firstChat.id.localeCompare(secondChat.id),
			);
			const expected = expectedChats.sort((firstChat, secondChat) =>
				firstChat.id.localeCompare(secondChat.id),
			);

			expect(chats).toHaveLength(expectedChats.length);
			expect(actual).toEqual(expected);
		});
	});
});
