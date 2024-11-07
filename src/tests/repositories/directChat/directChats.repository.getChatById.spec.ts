import { QueryBuilderMock } from '@TestMocks/queryBuilderMock';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { DirectChat } from '@Entities/DirectChat.entity';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { DataSource } from 'typeorm';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';

describe('directChatsRepository', () => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let directChatRepository: DirectChatsRepository;

	const directChatsMock: DirectChat[] = [...directChats];
	const directChatId: string = directChatsMock[0].id;
	const notExistingDirectChatId: string = '64594e48-478d-424f-af2a-4e256fd1f3a6';
	const lastMessageSubQueryMock: string = 'lastMessageSubQueryMock';

	const context: {
		selectedEntity: 'directChatMessage.id' | 'directChat' | '';
		whereValue: string;
	} = {
		selectedEntity: '',
		whereValue: '',
	};

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock();

		queryBuilderMock.select.mockImplementation((entity) => {
			if (['directChatMessage.id', 'DirectChatUsers.directChatId', 'directChat'].includes(entity)) {
				context.selectedEntity = entity;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.where.mockImplementation((_, config: { id: string }) => {
			if (config) {
				context.whereValue = config.id;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.getQuery.mockImplementation(() => {
			switch (context.selectedEntity) {
				case 'directChatMessage.id':
					return lastMessageSubQueryMock;

				default:
					break;
			}
		});

		queryBuilderMock.getOne.mockImplementation(
			() =>
				directChatsMock.find((directChat: DirectChat) => directChat.id === context.whereValue) ||
				null,
		);

		const dataSourceMock: jest.Mocked<Partial<DataSource>> = queryBuilderMock;

		directChatRepository = new DirectChatsRepository(dataSourceMock as DataSource);
	});

	describe('getChatById', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatRepository.getChatById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatRepository.getChatById).toBeInstanceOf(Function);
		});

		it('should create sub query for retrieving chat last message id', async (): Promise<void> => {
			await directChatRepository.getChatById(directChatId);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'directChatMessage.id');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'directChatMessage',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChatId = directChat.id',
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.updatedAt',
				'DESC',
			);

			expect(queryBuilderMock.limit).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.limit).toHaveBeenNthCalledWith(1, 1);

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(1);
		});

		it('should create query for retrieving direct chat by id', async (): Promise<void> => {
			await directChatRepository.getChatById(directChatId);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, 'directChat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(2, DirectChat, 'directChat');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'directChat.users',
				'users',
			);

			expect(queryBuilderMock.leftJoinAndMapMany).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndMapMany).toHaveBeenNthCalledWith(
				1,
				'directChat.messages',
				DirectChatMessage,
				'lastMessage',
				`lastMessage.id = (${lastMessageSubQueryMock})`,
			);

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'lastMessage.sender',
				'sender',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'directChat.id = :id', {
				id: directChatId,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return null if direct chat with given id does not exist', async (): Promise<void> => {
			const chat: DirectChat | null =
				await directChatRepository.getChatById(notExistingDirectChatId);

			expect(chat).toBeNull();
		});

		it('should return direct chat by given id', async (): Promise<void> => {
			const chat: DirectChat | null = await directChatRepository.getChatById(directChatId);

			expect(chat?.id).toBe(directChatId);
		});
	});
});
