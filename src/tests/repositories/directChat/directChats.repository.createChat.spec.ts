import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import { DateHelper } from '@Helpers/date.helper';
import { NotFoundException } from '@nestjs/common';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { users } from '@TestMocks/User/users';
import {
	DataSource,
	EntityManager,
	InsertQueryBuilder,
	InsertResult,
	RelationQueryBuilder,
} from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';

describe('directChatRepository', (): void => {
	let directChatRepository: DirectChatsRepository;

	const executeMockResult: string = 'a9bdc525-1c35-48c0-a0c6-79601d842f43';

	const context: { selectedEntity: 'user' | 'directChat' | ''; whereValue: string } = {
		selectedEntity: '',
		whereValue: '',
	};
	const directChatsMock: DirectChat[] = [...directChats];
	const usersMock: User[] = [...users];

	const createQueryBuilderMock: jest.Mock = jest.fn().mockReturnThis();
	const selectMock: jest.Mock = jest.fn().mockImplementation((entity) => {
		if (['user', 'directChat'].includes(entity)) {
			context.selectedEntity = entity;
		}

		return transactionalEntityManager;
	});
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockImplementation((_, config: { id: string }) => {
		context.whereValue = config.id;

		return transactionalEntityManager;
	});
	const getOneMock: jest.Mock = jest.fn().mockImplementation(() => {
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
	const insertMock: jest.Mock = jest.fn().mockReturnThis();
	const intoMock: jest.Mock = jest.fn().mockReturnThis();
	const valuesMock: jest.Mock = jest.fn().mockReturnThis();
	const relationMock: jest.Mock = jest.fn().mockReturnThis();
	const ofMock: jest.Mock = jest.fn().mockReturnThis();
	const addMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<InsertResult> => {
		return <InsertResult>{
			identifiers: <ObjectLiteral>[{ id: executeMockResult }],
		};
	});

	const transactionalEntityManager: Partial<EntityManager> &
		Partial<SelectQueryBuilder<never>> &
		Partial<InsertQueryBuilder<never>> &
		Partial<RelationQueryBuilder<never>> = {
		createQueryBuilder: createQueryBuilderMock,
		select: selectMock,
		from: fromMock,
		where: whereMock,
		getOne: getOneMock,
		insert: insertMock,
		into: intoMock,
		values: valuesMock,
		execute: executeMock,
		relation: relationMock,
		of: ofMock,
		add: addMock,
	};

	const dataSourceMock: jest.Mocked<Partial<DataSource>> = {
		transaction: jest.fn().mockImplementation(async (callback) => {
			await callback(transactionalEntityManager);
		}),
	};

	beforeAll((): void => {
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

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(7);

			expect(selectMock).toHaveBeenCalledTimes(3);
			expect(selectMock).toHaveBeenNthCalledWith(1, 'user');
			expect(selectMock).toHaveBeenNthCalledWith(2, 'user');

			expect(fromMock).toHaveBeenCalledTimes(3);
			expect(fromMock).toHaveBeenNthCalledWith(1, User, 'user');
			expect(fromMock).toHaveBeenNthCalledWith(2, User, 'user');

			expect(whereMock).toHaveBeenCalledTimes(3);
			expect(whereMock).toHaveBeenNthCalledWith(1, 'user.id = :id', { id: senderId });
			expect(whereMock).toHaveBeenNthCalledWith(2, 'user.id = :id', { id: receiverId });

			expect(getOneMock).toHaveBeenCalledTimes(3);
		});

		it('should use query builder to create query for creating new empty chat', async (): Promise<void> => {
			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(7);

			expect(insertMock).toHaveBeenCalledTimes(2);

			expect(intoMock).toHaveBeenCalledTimes(2);
			expect(intoMock).toHaveBeenNthCalledWith(1, DirectChat);

			expect(valuesMock).toHaveBeenCalledTimes(2);
			expect(valuesMock).toHaveBeenNthCalledWith(1, {});

			expect(executeMock).toHaveBeenCalledTimes(2);
		});

		it('should use query builder to create query for retrieving created chat', async (): Promise<void> => {
			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(7);

			expect(selectMock).toHaveBeenCalledTimes(3);
			expect(selectMock).toHaveBeenNthCalledWith(3, 'directChat');

			expect(fromMock).toHaveBeenCalledTimes(3);
			expect(fromMock).toHaveBeenNthCalledWith(3, DirectChat, 'directChat');

			expect(whereMock).toHaveBeenCalledTimes(3);
			expect(whereMock).toHaveBeenNthCalledWith(3, 'directChat.id = :id', {
				id: executeMockResult,
			});

			expect(getOneMock).toHaveBeenCalledTimes(3);
		});

		it('should use query builder to create query for assigning users to created chat', async (): Promise<void> => {
			const createdChat: DirectChat | null =
				directChatsMock.find((directChat: DirectChat) => directChat.id === context.whereValue) ||
				null;

			const sender: User | null = usersMock.find((user: User) => user.id === senderId) || null;
			const receiver: User | null = usersMock.find((user: User) => user.id === receiverId) || null;

			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(7);

			expect(relationMock).toHaveBeenCalledTimes(2);
			expect(relationMock).toHaveBeenNthCalledWith(1, DirectChat, 'users');
			expect(relationMock).toHaveBeenNthCalledWith(2, DirectChat, 'users');

			expect(ofMock).toHaveBeenCalledTimes(2);
			expect(ofMock).toHaveBeenNthCalledWith(1, createdChat);
			expect(ofMock).toHaveBeenNthCalledWith(2, createdChat);

			expect(addMock).toHaveBeenCalledTimes(2);
			expect(addMock).toHaveBeenNthCalledWith(1, sender);
			expect(addMock).toHaveBeenNthCalledWith(2, receiver);
		});

		it('should use query builder to create query for creating initial chat message', async (): Promise<void> => {
			const createdChat: DirectChat | null =
				directChatsMock.find((directChat: DirectChat) => directChat.id === context.whereValue) ||
				null;

			const sender: User | null = usersMock.find((user: User) => user.id === senderId) || null;

			await directChatRepository.createChat(senderId, receiverId, messageText, messageDateTime);

			expect(createQueryBuilderMock).toHaveBeenCalledTimes(7);

			expect(insertMock).toHaveBeenCalledTimes(2);

			expect(intoMock).toHaveBeenCalledTimes(2);
			expect(intoMock).toHaveBeenNthCalledWith(2, DirectChatMessage);

			expect(valuesMock).toHaveBeenCalledTimes(2);
			expect(valuesMock).toHaveBeenNthCalledWith(2, {
				dateTime: messageDateTime,
				messageText: messageText,
				directChat: createdChat,
				sender: sender,
			});

			expect(executeMock).toHaveBeenCalledTimes(2);
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
