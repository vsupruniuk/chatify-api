import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DirectChatsRepository } from '@repositories/directChats/directChats.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
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

	describe('Find by id with users', (): void => {
		const expectedDirectChat: DirectChat = directChats[0];

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedDirectChat);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsRepository.findByIdWithUsers).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsRepository.findByIdWithUsers).toBeInstanceOf(Function);
		});

		it('should use query builder to build a query for retrieving a chat with users by id', async (): Promise<void> => {
			await directChatsRepository.findByIdWithUsers(expectedDirectChat.id);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'direct_chat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, DirectChat, 'direct_chat');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'direct_chat.users',
				'users',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'direct_chat.id = :id', {
				id: expectedDirectChat.id,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return direct chat if it exist', async (): Promise<void> => {
			const directChat: DirectChat | null = await directChatsRepository.findByIdWithUsers(
				expectedDirectChat.id,
			);

			expect(directChat).toEqual(expectedDirectChat);
		});

		it('should return null if direct chat does not exist', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const directChat: DirectChat | null = await directChatsRepository.findByIdWithUsers(
				expectedDirectChat.id,
			);

			expect(directChat).toBeNull();
		});
	});
});
