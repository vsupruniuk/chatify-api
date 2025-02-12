import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DirectChatsRepository } from '@repositories/directChats.repository';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { DataSource } from 'typeorm';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';

describe.skip('directChatRepository', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let directChatRepository: DirectChatsRepository;

	const directChatsMock: DirectChat[] = [...directChats];
	const usersMock: User[] = [...users];

	const userIdMock: string = usersMock[3].id;
	const lastMessageSubQueryMock: string = 'lastMessageSubQueryMock';
	const userDirectChatsSubQueryMock: string = 'userDirectChatsSubQueryMock';

	const context: {
		selectedEntity: 'directChatMessage.id' | 'DirectChatUsers.directChatId' | 'directChat' | '';
	} = {
		selectedEntity: '',
	};

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock();

		queryBuilderMock.select.mockImplementation((entity) => {
			if (['directChatMessage.id', 'DirectChatUsers.directChatId', 'directChat'].includes(entity)) {
				context.selectedEntity = entity;
			}

			return queryBuilderMock;
		});
		queryBuilderMock.getQuery.mockImplementation(() => {
			switch (context.selectedEntity) {
				case 'directChatMessage.id':
					return lastMessageSubQueryMock;

				case 'DirectChatUsers.directChatId':
					return userDirectChatsSubQueryMock;

				default:
					break;
			}
		});
		queryBuilderMock.getMany.mockImplementation(() => directChatsMock);

		const dataSourceMock: jest.Mocked<Partial<DataSource>> = queryBuilderMock;

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

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'directChatMessage.id');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'directChatMessage',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChatId = directChat.id',
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.updatedAt',
				'DESC',
			);

			expect(queryBuilderMock.limit).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.limit).toHaveBeenNthCalledWith(1, 1);

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(2);
		});

		it('should create sub query for retrieving user direct chats ids', async (): Promise<void> => {
			await directChatRepository.getLastChats(userIdMock, 1, 1);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, 'DirectChatUsers.directChatId');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				2,
				'DirectChatUsers',
				'DirectChatUsers',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'DirectChatUsers.userId = :userId');

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(2);
		});

		it('should create query for retrieving user direct chats with last message and users info', async (): Promise<void> => {
			const skip: number = 10;
			const take: number = 10;

			await directChatRepository.getLastChats(userIdMock, skip, take);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(3, 'directChat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(3, DirectChat, 'directChat');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'directChat.users',
				'users',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'lastMessage.sender',
				'sender',
			);

			expect(queryBuilderMock.leftJoinAndMapMany).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndMapMany).toHaveBeenNthCalledWith(
				1,
				'directChat.messages',
				DirectChatMessage,
				'lastMessage',
				`lastMessage.id = (${lastMessageSubQueryMock})`,
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				3,
				`directChat.id IN (${userDirectChatsSubQueryMock})`,
			);

			expect(queryBuilderMock.setParameter).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.setParameter).toHaveBeenNthCalledWith(1, 'userId', userIdMock);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(2, 'lastMessage.updatedAt', 'DESC');

			expect(queryBuilderMock.skip).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.skip).toHaveBeenNthCalledWith(1, skip);

			expect(queryBuilderMock.take).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.take).toHaveBeenNthCalledWith(1, take);

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
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
