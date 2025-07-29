import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { DirectChatMessagesRepository } from '@repositories/directChatMessages/directChatMessages.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { directChats } from '@testMocks/DirectChat/directChats';

describe('Direct chat messages repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let directChatMessagesRepository: DirectChatMessagesRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: DataSource, useValue: queryBuilderMock },
				DirectChatMessagesRepository,
			],
		}).compile();

		directChatMessagesRepository = moduleFixture.get(DirectChatMessagesRepository);
	});

	describe('Find last messages by direct chat id', (): void => {
		const expectedMessages: DirectChatMessage[] = directChatsMessages.slice(0, 2);
		const directChatId: string = directChats[0].id;
		const skip: number = 5;
		const take: number = 10;

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder to create a query for searching messages', async (): Promise<void> => {
			await directChatMessagesRepository.findLastMessagesByDirectChatId(directChatId, skip, take);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'direct_chat_messages');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(
				1,
				DirectChatMessage,
				'direct_chat_messages',
			);

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(3);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'direct_chat_messages.directChat',
				'directChat',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				2,
				'directChat.users',
				'direct_chat_users',
			);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				3,
				'direct_chat_messages.sender',
				'sender',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(
				1,
				'direct_chat_messages.direct_chat_id = :directChatId',
				{ directChatId },
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(
				1,
				'direct_chat_messages.createdAt',
				'DESC',
			);

			expect(queryBuilderMock.skip).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.skip).toHaveBeenNthCalledWith(1, skip);

			expect(queryBuilderMock.take).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.take).toHaveBeenNthCalledWith(1, take);

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
		});

		it('should return empty array if no messages found', async (): Promise<void> => {
			queryBuilderMock.getMany.mockReturnValue([]);

			const messages: DirectChatMessage[] =
				await directChatMessagesRepository.findLastMessagesByDirectChatId(directChatId, skip, take);

			expect(messages).toHaveLength(0);
		});

		it('should return array of relevant messages', async (): Promise<void> => {
			queryBuilderMock.getMany.mockReturnValue(expectedMessages);

			const messages: DirectChatMessage[] =
				await directChatMessagesRepository.findLastMessagesByDirectChatId(directChatId, skip, take);

			expect(messages).toHaveLength(expectedMessages.length);

			expect(messages.sort()).toEqual(expectedMessages.sort());
		});
	});
});
