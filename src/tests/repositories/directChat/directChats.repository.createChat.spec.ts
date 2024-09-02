import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import { DateHelper } from '@Helpers/date.helper';
import { NotFoundException } from '@nestjs/common';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { users } from '@TestMocks/User/users';
import { DataSource, InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { QueryBuilderMock } from '@TestMocks/queryBuilderMock';

describe('directChatRepository', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let dataSourceMock: jest.Mocked<Partial<DataSource>>;
	let directChatRepository: DirectChatsRepository;

	const executeMockResult: string = 'a9bdc525-1c35-48c0-a0c6-79601d842f43';
	const directChatsMock: DirectChat[] = [...directChats];
	const usersMock: User[] = [...users];

	const context: { selectedEntity: 'user' | 'directChat' | ''; whereValue: string } = {
		selectedEntity: '',
		whereValue: '',
	};

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock<never>();

		queryBuilderMock.select.mockImplementation((entity) => {
			if (['user', 'directChat'].includes(entity)) {
				context.selectedEntity = entity;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.where.mockImplementation((_, config: { id: string }) => {
			context.whereValue = config.id;

			return queryBuilderMock;
		});

		queryBuilderMock.getOne.mockImplementation(() => {
			if (context.selectedEntity === 'directChat') {
				return (
					directChatsMock.find((directChat: DirectChat) => directChat.id === context.whereValue) ||
					null
				);
			}

			if (context.selectedEntity === 'user') {
				return usersMock.find((user: User) => user.id === context.whereValue) || null;
			}

			return null;
		});

		queryBuilderMock.execute.mockImplementation(async (): Promise<InsertResult> => {
			return <InsertResult>{
				identifiers: <ObjectLiteral>[{ id: executeMockResult }],
			};
		});

		dataSourceMock = {
			transaction: jest.fn().mockImplementation(async (callback) => {
				await callback(queryBuilderMock);
			}),
		};

		directChatRepository = new DirectChatsRepository(dataSourceMock as DataSource);
	});

	describe('createChat', (): void => {
		const senderId: string = 'f42845d7-90af-4c29-8e1a-227c90b33852';
		const receiverId: string = '699901e8-653f-4ac2-841e-b85388c4b89c';
		const messageText: string = 'Hello, Tony';
		const messageDateTime: string = DateHelper.dateTimeNow();

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatRepository.createChat).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatRepository.createChat).toBeInstanceOf(Function);
		});

		it('should use query builder to create queries for retrieving sender and receiver', async (): Promise<void> => {
			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(7);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(2, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.id = :id', {
				id: senderId,
			});
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'user.id = :id', {
				id: receiverId,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(3);
		});

		it('should use query builder to create query for creating new empty chat', async (): Promise<void> => {
			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(7);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(1, DirectChat);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(1, {});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use query builder to create query for retrieving created chat', async (): Promise<void> => {
			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(7);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(3, 'directChat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(3, DirectChat, 'directChat');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(3, 'directChat.id = :id', {
				id: executeMockResult,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(3);
		});

		it('should use query builder to create query for assigning users to created chat', async (): Promise<void> => {
			const createdChat: DirectChat | null =
				directChatsMock.find((directChat: DirectChat) => directChat.id === context.whereValue) ||
				null;

			const sender: User | null = usersMock.find((user: User) => user.id === senderId) || null;
			const receiver: User | null = usersMock.find((user: User) => user.id === receiverId) || null;

			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(7);

			expect(queryBuilderMock.relation).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.relation).toHaveBeenNthCalledWith(1, DirectChat, 'users');
			expect(queryBuilderMock.relation).toHaveBeenNthCalledWith(2, DirectChat, 'users');

			expect(queryBuilderMock.of).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.of).toHaveBeenNthCalledWith(1, createdChat);
			expect(queryBuilderMock.of).toHaveBeenNthCalledWith(2, createdChat);

			expect(queryBuilderMock.add).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.add).toHaveBeenNthCalledWith(1, sender);
			expect(queryBuilderMock.add).toHaveBeenNthCalledWith(2, receiver);
		});

		it('should use query builder to create query for creating initial chat message', async (): Promise<void> => {
			const createdChat: DirectChat | null =
				directChatsMock.find((directChat: DirectChat) => directChat.id === context.whereValue) ||
				null;

			const sender: User | null = usersMock.find((user: User) => user.id === senderId) || null;

			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(7);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(2, DirectChatMessage);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(2, {
				dateTime: messageDateTime,
				messageText: messageText,
				directChat: createdChat,
				sender: sender,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(2);
		});

		it('should use transaction to hande failed queries', async (): Promise<void> => {
			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
		});

		it('should throw error if message sender does not exist', async (): Promise<void> => {
			const notExistingSender: string = 'f42845d7-90af-4c29-8e1a-227c90b33842';

			await expect(
				directChatRepository.createChat(
					notExistingSender,
					receiverId,
					messageText,
					messageDateTime,
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw error if message receiver does not exist', async (): Promise<void> => {
			const notExistingReceiver: string = 'f42845d7-90af-4c29-8e1a-227c90b33842';

			await expect(
				directChatRepository.createChat(
					senderId,
					notExistingReceiver,
					messageText,
					messageDateTime,
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw error with correct message if sender or receiver does not exist', async (): Promise<void> => {
			const notExistingReceiver: string = 'f42845d7-90af-4c29-8e1a-227c90b33842';

			await expect(
				directChatRepository.createChat(
					senderId,
					notExistingReceiver,
					messageText,
					messageDateTime,
				),
			).rejects.toThrow('One of chat users does not exist');
		});

		it('should return id of created chat', async (): Promise<void> => {
			const createdChatId: string = await directChatRepository.createChat(
				senderId,
				receiverId,
				messageText,
				messageDateTime,
			);

			expect(createdChatId).toBe(executeMockResult);
		});
	});
});
