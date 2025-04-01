import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DataSource, InsertResult } from 'typeorm';
import { DirectChatMessagesRepository } from '@repositories/directChatMessages/directChatMessages.repository';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { DateHelper } from '@helpers/date.helper';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { NotFoundException } from '@nestjs/common';

describe.skip('Direct chats repository', () => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let dataSourceMock: jest.Mocked<Partial<DataSource>>;
	let directChatMessagesRepository: DirectChatMessagesRepository;

	const createdMessageId: string = '96acb907-c157-4ba7-89c0-668bd400365a';
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
				identifiers: <ObjectLiteral>[{ id: createdMessageId }],
			};
		});

		dataSourceMock = queryBuilderMock;
		directChatMessagesRepository = new DirectChatMessagesRepository(dataSourceMock as DataSource);
	});

	describe('Create Message', (): void => {
		const senderId: string = 'f42845d7-90af-4c29-8e1a-227c90b33852';
		const directChatId: string = 'a9bdc525-1c35-48c0-a0c6-79601d842f43';
		const messageText: string = 'Hello, Tony';
		const messageDateTime: string = DateHelper.dateTimeNow();

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatMessagesRepository.createMessage).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatMessagesRepository.createMessage).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query for retrieving message sender', async (): Promise<void> => {
			await directChatMessagesRepository.createMessage(
				senderId,
				directChatId,
				messageText,
				messageDateTime,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.id = :id', { id: senderId });

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(2);
		});

		it('should use queryBuilder to build query for retrieving message directChat', async (): Promise<void> => {
			await directChatMessagesRepository.createMessage(
				senderId,
				directChatId,
				messageText,
				messageDateTime,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(2, 'directChat');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(2, DirectChat, 'directChat');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, 'directChat.id = :id', {
				id: directChatId,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(2);
		});

		it('should use queryBuilder to build query for creating message', async (): Promise<void> => {
			const directChat: DirectChat | null =
				directChatsMock.find((directChat: DirectChat) => directChat.id === directChatId) || null;

			const sender: User | null = usersMock.find((user: User) => user.id === senderId) || null;

			await directChatMessagesRepository.createMessage(
				senderId,
				directChatId,
				messageText,
				messageDateTime,
			);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(3);

			expect(queryBuilderMock.insert).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.into).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.into).toHaveBeenNthCalledWith(1, DirectChatMessage);

			expect(queryBuilderMock.values).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.values).toHaveBeenNthCalledWith(1, {
				dateTime: messageDateTime,
				messageText,
				directChat,
				sender,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should throw NotFoundException if message sender does not exist', async (): Promise<void> => {
			const notExistingSenderId: string = 'f44845d7-91af-4c29-8e1a-227c91b33852';

			await expect(
				directChatMessagesRepository.createMessage(
					notExistingSenderId,
					directChatId,
					messageText,
					messageDateTime,
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw NotFoundException if directChat does not exist', async (): Promise<void> => {
			const notExistingDirectChatId: string = 'f44845d7-91af-4c29-8e1a-227c91b33852';

			await expect(
				directChatMessagesRepository.createMessage(
					senderId,
					notExistingDirectChatId,
					messageText,
					messageDateTime,
				),
			).rejects.toThrow(NotFoundException);
		});

		it('should return id of created message', async (): Promise<void> => {
			const messageId: string = await directChatMessagesRepository.createMessage(
				senderId,
				directChatId,
				messageText,
				messageDateTime,
			);

			expect(messageId).toBe(createdMessageId);
		});
	});
});
