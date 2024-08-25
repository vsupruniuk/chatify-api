import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { DirectChat } from '@Entities/DirectChat.entity';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { User } from '@Entities/User.entity';
import { users } from '@TestMocks/User/users';
import { DataSource, EntityManager } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';

describe('directChatRepository', (): void => {
	let directChatRepository: DirectChatsRepository;

	const context: {
		selectedEntity: 'directChatMessage.id' | 'DirectChatUsers.directChatId' | 'directChat' | '';
	} = {
		selectedEntity: '',
	};

	const directChatsMock: DirectChat[] = [...directChats];
	const usersMock: User[] = [...users];

	const userIdMock: string = usersMock[3].id;
	const lastMessageSubQueryMock: string = 'lastMessageSubQueryMock';
	const userDirectChatsSubQueryMock: string = 'userDirectChatsSubQueryMock';

	const createQueryBuilderMock: jest.Mock = jest.fn().mockImplementation(() => entityManager);
	const selectMock: jest.Mock = jest.fn().mockImplementation((entity) => {
		if (['directChatMessage.id', 'DirectChatUsers.directChatId', 'directChat'].includes(entity)) {
			context.selectedEntity = entity;
		}

		return entityManager;
	});
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const leftJoinAndSelectMock: jest.Mock = jest.fn().mockReturnThis();
	const leftJoinAndMapManyMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const setParameterMock: jest.Mock = jest.fn().mockReturnThis();
	const orderByMock: jest.Mock = jest.fn().mockReturnThis();
	const limitMock: jest.Mock = jest.fn().mockReturnThis();
	const skipMock: jest.Mock = jest.fn().mockReturnThis();
	const takeMock: jest.Mock = jest.fn().mockReturnThis();
	const getQueryMock: jest.Mock = jest.fn().mockImplementation(() => {
		switch (context.selectedEntity) {
			case 'directChatMessage.id':
				return lastMessageSubQueryMock;

			case 'DirectChatUsers.directChatId':
				return userDirectChatsSubQueryMock;

			default:
				break;
		}
	});
	const getManyMock: jest.Mock = jest.fn().mockImplementation(() => directChatsMock);

	const entityManager: Partial<EntityManager> & Partial<SelectQueryBuilder<never>> = {
		createQueryBuilder: createQueryBuilderMock,
		select: selectMock,
		from: fromMock,
		leftJoinAndSelect: leftJoinAndSelectMock,
		leftJoinAndMapMany: leftJoinAndMapManyMock,
		where: whereMock,
		setParameter: setParameterMock,
		orderBy: orderByMock,
		limit: limitMock,
		getQuery: getQueryMock,
		skip: skipMock,
		take: takeMock,
		getMany: getManyMock,
	};

	const dataSourceMock: jest.Mocked<Partial<DataSource>> = {
		createQueryBuilder: createQueryBuilderMock,
	};

	beforeAll((): void => {
		directChatRepository = new DirectChatsRepository(dataSourceMock as DataSource);
	});

	describe('getChats', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatRepository.getLastChats).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatRepository.getLastChats).toBeInstanceOf(Function);
		});

		it('should create sub query for retrieving chat last message id', async (): Promise<void> => {
			await directChatRepository.getLastChats(userIdMock, 1, 1);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(3);

			expect(selectMock).toHaveBeenCalledTimes(3);
			expect(selectMock).toHaveBeenNthCalledWith(1, 'directChatMessage.id');

			expect(fromMock).toHaveBeenCalledTimes(3);
			expect(fromMock).toHaveBeenNthCalledWith(1, DirectChatMessage, 'directChatMessage');

			expect(whereMock).toHaveBeenCalledTimes(3);
			expect(whereMock).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChatId = directChat.id',
			);

			expect(orderByMock).toHaveBeenCalledTimes(2);
			expect(orderByMock).toHaveBeenNthCalledWith(1, 'directChatMessage.updatedAt', 'DESC');

			expect(limitMock).toHaveBeenCalledTimes(1);
			expect(limitMock).toHaveBeenNthCalledWith(1, 1);

			expect(getQueryMock).toHaveBeenCalledTimes(2);
		});

		it('should create sub query for retrieving user direct chats ids', async (): Promise<void> => {
			await directChatRepository.getLastChats(userIdMock, 1, 1);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(3);

			expect(selectMock).toHaveBeenCalledTimes(3);
			expect(selectMock).toHaveBeenNthCalledWith(2, 'DirectChatUsers.directChatId');

			expect(fromMock).toHaveBeenCalledTimes(3);
			expect(fromMock).toHaveBeenNthCalledWith(2, 'DirectChatUsers', 'DirectChatUsers');

			expect(whereMock).toHaveBeenCalledTimes(3);
			expect(whereMock).toHaveBeenNthCalledWith(2, 'DirectChatUsers.userId = :userId');

			expect(getQueryMock).toHaveBeenCalledTimes(2);
		});

		it('should create query for retrieving user direct chats with last message and users info', async (): Promise<void> => {
			const skip: number = 10;
			const take: number = 10;

			await directChatRepository.getLastChats(userIdMock, skip, take);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(3);

			expect(selectMock).toHaveBeenCalledTimes(3);
			expect(selectMock).toHaveBeenNthCalledWith(3, 'directChat');

			expect(fromMock).toHaveBeenCalledTimes(3);
			expect(fromMock).toHaveBeenNthCalledWith(3, DirectChat, 'directChat');

			expect(leftJoinAndSelectMock).toHaveBeenCalledTimes(2);
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(1, 'directChat.users', 'users');
			expect(leftJoinAndSelectMock).toHaveBeenNthCalledWith(2, 'lastMessage.sender', 'sender');

			expect(leftJoinAndMapManyMock).toHaveBeenCalledTimes(1);
			expect(leftJoinAndMapManyMock).toHaveBeenNthCalledWith(
				1,
				'directChat.messages',
				DirectChatMessage,
				'lastMessage',
				`lastMessage.id = (${lastMessageSubQueryMock})`,
			);

			expect(whereMock).toHaveBeenCalledTimes(3);
			expect(whereMock).toHaveBeenNthCalledWith(
				3,
				`directChat.id IN (${userDirectChatsSubQueryMock})`,
			);

			expect(setParameterMock).toHaveBeenCalledTimes(1);
			expect(setParameterMock).toHaveBeenNthCalledWith(1, 'userId', userIdMock);

			expect(orderByMock).toHaveBeenCalledTimes(2);
			expect(orderByMock).toHaveBeenNthCalledWith(2, 'lastMessage.updatedAt', 'DESC');

			expect(skipMock).toHaveBeenCalledTimes(1);
			expect(skipMock).toHaveBeenNthCalledWith(1, skip);

			expect(takeMock).toHaveBeenCalledTimes(1);
			expect(takeMock).toHaveBeenNthCalledWith(1, take);

			expect(getManyMock).toHaveBeenCalledTimes(1);
		});

		it('should return array of Direct Chats', async (): Promise<void> => {
			const skip: number = 10;
			const take: number = 10;

			const directChats: DirectChat[] = await directChatRepository.getLastChats(
				userIdMock,
				skip,
				take,
			);

			expect(directChats).toBeInstanceOf(Array);

			directChats.forEach((directChat: DirectChat) => {
				expect(directChat).toBeInstanceOf(DirectChat);
			});
		});
	});
});
