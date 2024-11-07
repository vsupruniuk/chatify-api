import { QueryBuilderMock } from '@TestMocks/queryBuilderMock';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { DirectChat } from '@Entities/DirectChat.entity';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { users } from '@TestMocks/User/users';
import { DataSource } from 'typeorm';

describe('directChatsRepository', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let directChatRepository: DirectChatsRepository;

	const directChatMock: DirectChat = directChats[0];
	const firstUserIdMock: string = users[2].id;
	const secondUserIdMock: string = users[3].id;
	const incorrectUserIdMock: string = users[4].id;
	const firstUserExistCondition: string = `${firstUserIdMock}-existCondition`;
	const secondUserExistCondition: string = `${secondUserIdMock}-existCondition`;
	const incorrectUserExistCondition: string = `${incorrectUserIdMock}-existCondition`;

	let context: {
		whereExistsValue: string;
		andWhereExistsValue: string;
	} = {
		whereExistsValue: '',
		andWhereExistsValue: '',
	};

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock();

		queryBuilderMock.andWhere.mockImplementation((_, config: { userId: string }): string => {
			if (config.userId === firstUserIdMock) {
				return firstUserExistCondition;
			}

			if (config.userId === secondUserIdMock) {
				return secondUserExistCondition;
			}

			return incorrectUserExistCondition;
		});

		queryBuilderMock.whereExists.mockImplementation((condition) => {
			if (condition === firstUserExistCondition || condition === secondUserExistCondition) {
				context.whereExistsValue = condition;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.andWhereExists.mockImplementation((condition) => {
			if (condition === firstUserExistCondition || condition === secondUserExistCondition) {
				context.andWhereExistsValue = condition;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.getOne.mockImplementation((): DirectChat | null => {
			if (
				(context.whereExistsValue === firstUserExistCondition ||
					context.whereExistsValue === secondUserExistCondition) &&
				(context.andWhereExistsValue === firstUserExistCondition ||
					context.andWhereExistsValue === secondUserExistCondition)
			) {
				return directChatMock;
			}

			return null;
		});

		const dataSourceMock: jest.Mocked<Partial<DataSource>> = queryBuilderMock;

		directChatRepository = new DirectChatsRepository(dataSourceMock as DataSource);
	});

	describe('getChatByUsers', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();

			context = {
				whereExistsValue: '',
				andWhereExistsValue: '',
			};
		});

		it('should be declared', (): void => {
			expect(directChatRepository.getChatByUsers).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatRepository.getChatByUsers).toBeInstanceOf(Function);
		});

		it('should use query builder to create a query for check if first user exist in some chats', async (): Promise<void> => {
			await directChatRepository.getChatByUsers(firstUserIdMock, secondUserIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				'DirectChatUsers',
				'directChatUsers',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'directChatUsers.directChatId = directChat.id',
			);

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
				1,
				'directChatUsers.userId = :userId',
				{ userId: firstUserIdMock },
			);
		});

		it('should use query builder to create a query for check if second user exist in some chats', async (): Promise<void> => {
			await directChatRepository.getChatByUsers(firstUserIdMock, secondUserIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, '*');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				2,
				'DirectChatUsers',
				'directChatUsers',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				2,
				'directChatUsers.directChatId = directChat.id',
			);

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
				2,
				'directChatUsers.userId = :userId',
				{ userId: secondUserIdMock },
			);
		});

		it('should use query builder to retrieve chat by its users', async (): Promise<void> => {
			await directChatRepository.getChatByUsers(firstUserIdMock, secondUserIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(3, 'directChat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(3, DirectChat, 'directChat');

			expect(queryBuilderMock.whereExists).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.whereExists).toHaveBeenNthCalledWith(1, firstUserExistCondition);

			expect(queryBuilderMock.andWhereExists).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.andWhereExists).toHaveBeenNthCalledWith(1, secondUserExistCondition);

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return null if first user does not belong to any chat', async (): Promise<void> => {
			const chat: DirectChat | null = await directChatRepository.getChatByUsers(
				incorrectUserIdMock,
				secondUserIdMock,
			);

			expect(chat).toBeNull();
		});

		it('should return null if second user does not belong to any chat', async (): Promise<void> => {
			const chat: DirectChat | null = await directChatRepository.getChatByUsers(
				firstUserIdMock,
				incorrectUserIdMock,
			);

			expect(chat).toBeNull();
		});

		it('should return founded chat if both users belongs to this chat', async (): Promise<void> => {
			const chat: DirectChat | null = await directChatRepository.getChatByUsers(
				firstUserIdMock,
				secondUserIdMock,
			);

			expect(chat?.id).toBe(directChatMock.id);
		});
	});
});
