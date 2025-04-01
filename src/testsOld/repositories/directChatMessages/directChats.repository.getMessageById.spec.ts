import { DirectChatMessagesRepository } from '@repositories/directChatMessages/directChatMessages.repository';
import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DataSource } from 'typeorm';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';

describe.skip('Direct chats repository', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let dataSourceMock: jest.Mocked<Partial<DataSource>>;
	let directChatMessagesRepository: DirectChatMessagesRepository;

	const directChatsMessagesMock: DirectChatMessage[] = [...directChatsMessages];
	const messageId: string = directChatsMessagesMock[0].id;
	const notExistingMessageId: string = 'a25d0f16-8255-4cf4-a06a-167271bd2720';

	const context: {
		selectedEntity: 'directChatMessage' | '';
		whereValue: string;
	} = {
		selectedEntity: '',
		whereValue: '',
	};

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock<never>();

		queryBuilderMock.select.mockImplementation((entity) => {
			if (['directChatMessage'].includes(entity)) {
				context.selectedEntity = entity;
			}

			return queryBuilderMock;
		});

		queryBuilderMock.where.mockImplementation((_, config: { id: string }) => {
			context.whereValue = config.id;

			return queryBuilderMock;
		});

		queryBuilderMock.getOne.mockImplementation(() => {
			if (context.selectedEntity === 'directChatMessage') {
				return (
					directChatsMessagesMock.find(
						(directChatMessage: DirectChatMessage) => directChatMessage.id === context.whereValue,
					) || null
				);
			}

			return null;
		});

		dataSourceMock = queryBuilderMock;
		directChatMessagesRepository = new DirectChatMessagesRepository(dataSourceMock as DataSource);
	});

	describe('getMessageById', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatMessagesRepository.getMessageById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatMessagesRepository.getMessageById).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query for retrieving message by id', async (): Promise<void> => {
			await directChatMessagesRepository.getMessageById(messageId);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'directChatMessage');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'directChatMessage',
			);

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChat',
				'directChat',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'directChatMessage.sender',
				'sender',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				3,
				'directChat.users',
				'directChatUsers',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'directChatMessage.id = :id', {
				id: messageId,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return message by its id', async (): Promise<void> => {
			const message: DirectChatMessage | null =
				await directChatMessagesRepository.getMessageById(messageId);

			expect(message?.id).toEqual(messageId);
		});

		it('should return null if message with provided id does not exist', async (): Promise<void> => {
			const message: DirectChatMessage | null =
				await directChatMessagesRepository.getMessageById(notExistingMessageId);

			expect(message).toBeNull();
		});
	});
});
