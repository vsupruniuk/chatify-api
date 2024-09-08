import { QueryBuilderMock } from '@TestMocks/queryBuilderMock';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { directChatsMessages } from '@TestMocks/DirectChatMessage/directChatsMessages';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { DataSource } from 'typeorm';

describe('directChatsMock', (): void => {
	let queryBuilderMock: QueryBuilderMock<never>;
	let directChatRepository: DirectChatsRepository;

	const directChatsMessagesMock: DirectChatMessage[] = [...directChatsMessages];
	const directChatIdMock: string = directChats[0].id;

	beforeAll((): void => {
		queryBuilderMock = new QueryBuilderMock();

		queryBuilderMock.getMany.mockImplementation(() => {
			return directChatsMessagesMock.filter(
				(directChatsMessages: DirectChatMessage) =>
					directChatsMessages.directChat.id === directChatIdMock,
			);
		});

		const dataSourceMock: jest.Mocked<Partial<DataSource>> = queryBuilderMock;

		directChatRepository = new DirectChatsRepository(dataSourceMock as DataSource);
	});

	describe('getChatMessages', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatRepository.getChatMessages).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatRepository.getChatMessages).toBeInstanceOf(Function);
		});

		it('should create query for retrieving last direct chat messages', async (): Promise<void> => {
			const skip: number = 0;
			const take: number = 10;

			await directChatRepository.getChatMessages(directChatIdMock, skip, take);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'directChatMessage');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'directChatMessage',
			);

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(2);
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

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.directChatId = :directChatId',
				{ directChatId: directChatIdMock },
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'directChatMessage.createdAt',
				'DESC',
			);

			expect(queryBuilderMock.skip).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.skip).toHaveBeenNthCalledWith(1, skip);

			expect(queryBuilderMock.take).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.take).toHaveBeenNthCalledWith(1, take);

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
		});

		it('should return array of DirectChatMessage', async (): Promise<void> => {
			const messages: DirectChatMessage[] = await directChatRepository.getChatMessages(
				directChatIdMock,
				0,
				10,
			);

			expect(messages).toBeInstanceOf(Array);

			for (const message of messages) {
				expect(message).toBeInstanceOf(DirectChatMessage);
			}
		});
	});
});
