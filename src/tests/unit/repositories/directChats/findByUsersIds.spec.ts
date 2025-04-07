import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DirectChatsRepository } from '@repositories/directChats/directChats.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { users } from '@testMocks/User/users';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';

describe('Direct chats repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let directChatsRepository: DirectChatsRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, DirectChatsRepository],
		}).compile();

		directChatsRepository = moduleFixture.get(DirectChatsRepository);
	});

	describe('Find by users ids', (): void => {
		const expectedDirectChat: DirectChat = directChats[2];
		const firstUserIdMock: string = users[3].id;
		const secondUserIdMock: string = users[4].id;
		const chatWithFirstUserMock: string = 'chatWithFirstUserMock';
		const chatWithSecondUserMock: string = 'chatWithSecondUserMock';

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedDirectChat);

			queryBuilderMock.andWhere.mockImplementation(
				(condition: string, parameters: { userId: string }): string => {
					return parameters.userId === firstUserIdMock
						? chatWithFirstUserMock
						: chatWithSecondUserMock;
				},
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsRepository.findByUsersIds).toBeDefined();
		});

		it('should be a functions', (): void => {
			expect(directChatsRepository.findByUsersIds).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query condition for existing chats for a first user', async (): Promise<void> => {
			await directChatsRepository.findByUsersIds(firstUserIdMock, secondUserIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				'direct_chats_users',
				'direct_chats_users',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'direct_chats_users.direct_chat_id = direct_chat.id',
			);

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
				1,
				'direct_chats_users.user_id = :userId',
				{ userId: firstUserIdMock },
			);
		});

		it('should use query builder and create a query condition for existing chats for a second user', async (): Promise<void> => {
			await directChatsRepository.findByUsersIds(firstUserIdMock, secondUserIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, '*');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				2,
				'direct_chats_users',
				'direct_chats_users',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				2,
				'direct_chats_users.direct_chat_id = direct_chat.id',
			);

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
				2,
				'direct_chats_users.user_id = :userId',
				{ userId: secondUserIdMock },
			);
		});

		it('should use query builder and create a query for searching direct chat between users', async (): Promise<void> => {
			await directChatsRepository.findByUsersIds(firstUserIdMock, secondUserIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(3, 'direct_chat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(3, DirectChat, 'direct_chat');

			expect(queryBuilderMock.whereExists).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.whereExists).toHaveBeenNthCalledWith(1, chatWithFirstUserMock);

			expect(queryBuilderMock.andWhereExists).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.andWhereExists).toHaveBeenNthCalledWith(1, chatWithSecondUserMock);

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return direct chat if it was found', async (): Promise<void> => {
			const chat: DirectChat | null = await directChatsRepository.findByUsersIds(
				firstUserIdMock,
				secondUserIdMock,
			);

			expect(chat).toEqual(expectedDirectChat);
		});

		it('should return null if direct chat was not found', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const chat: DirectChat | null = await directChatsRepository.findByUsersIds(
				firstUserIdMock,
				secondUserIdMock,
			);

			expect(chat).toBeNull();
		});
	});
});
