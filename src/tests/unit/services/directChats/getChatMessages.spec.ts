import { DirectChatsService } from '@services/directChats/directChats.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsRepository } from '@repositories/directChats/IDirectChatsRepository';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';
import { IDirectChatMessagesRepository } from '@repositories/directChatMessages/IDirectChatMessagesRepository';
import { TransformHelper } from '@helpers/transform.helper';
import { PaginationHelper } from '@helpers/pagination.helper';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';
import { users } from '@testMocks/User/users';
import { User } from '@entities/User.entity';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { plainToInstance } from 'class-transformer';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('Direct chats service', (): void => {
	let directChatsService: DirectChatsService;
	let directChatsRepository: IDirectChatsRepository;
	let directChatsMessagesRepository: IDirectChatMessagesRepository;
	let decryptionStrategyManager: IDecryptionStrategyManager;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsService,

				DirectChatWithUsersAndMessagesStrategy,
				DirectChatMessageWithChatAndUserStrategy,

				providers.CTF_DIRECT_CHATS_REPOSITORY,
				providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

				providers.CTF_DECRYPTION_STRATEGY_MANAGER,
				providers.CTF_CRYPTO_SERVICE,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		directChatsService = moduleFixture.get(DirectChatsService);
		directChatsRepository = moduleFixture.get(CustomProviders.CTF_DIRECT_CHATS_REPOSITORY);
		directChatsMessagesRepository = moduleFixture.get(
			CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
		);
		decryptionStrategyManager = moduleFixture.get(CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER);
	});

	describe('Get chat messages', (): void => {
		const directChatMock: DirectChat = directChats[0];
		const directChatMessagesMock: DirectChatMessage[] = directChatsMessages.slice(0, 3);
		const usersMock: User[] = users.slice(1, 3);

		const userId: string = usersMock[0].id;
		const directChatId: string = directChatMock.id;
		const page: number = 0;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(TransformHelper, 'toTargetDto');
			jest.spyOn(PaginationHelper, 'toSQLPagination').mockReturnValue({ skip: page, take });

			jest
				.spyOn(directChatsRepository, 'findByIdWithUsers')
				.mockResolvedValue({ ...directChatMock, users: [...usersMock] });

			jest
				.spyOn(directChatsMessagesRepository, 'findLastMessagesByDirectChatId')
				.mockResolvedValue(directChatMessagesMock);

			jest.spyOn(decryptionStrategyManager, 'decrypt').mockImplementation(async (data: object) => {
				return plainToInstance(DirectChatMessageWithChatAndUserDto, data, {
					excludeExtraneousValues: true,
				});
			});
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsService.getChatMessages).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.getChatMessages).toBeInstanceOf(Function);
		});

		it('should call to sql pagination method from pagination helper to create pagination parameters for repository method', async (): Promise<void> => {
			await directChatsService.getChatMessages(userId, directChatId, page, take);

			expect(PaginationHelper.toSQLPagination).toHaveBeenCalledTimes(1);
			expect(PaginationHelper.toSQLPagination).toHaveBeenNthCalledWith(1, page, take);
		});

		it('should call find by id with users method from direct chats repository to find a chat by id', async (): Promise<void> => {
			await directChatsService.getChatMessages(userId, directChatId, page, take);

			expect(directChatsRepository.findByIdWithUsers).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.findByIdWithUsers).toHaveBeenNthCalledWith(1, directChatId);
		});

		it('should throw not found exception if direct chat was not found', async (): Promise<void> => {
			jest.spyOn(directChatsRepository, 'findByIdWithUsers').mockResolvedValue(null);

			await expect(
				directChatsService.getChatMessages(userId, directChatId, page, take),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw bad request exception if user id does not match with any of chat users ids', async (): Promise<void> => {
			await expect(
				directChatsService.getChatMessages('fakeUserId', directChatId, page, take),
			).rejects.toThrow(BadRequestException);
		});

		it('should call find last messages by direct chat id', async (): Promise<void> => {
			await directChatsService.getChatMessages(userId, directChatId, page, take);

			expect(directChatsMessagesRepository.findLastMessagesByDirectChatId).toHaveBeenCalledTimes(1);
			expect(directChatsMessagesRepository.findLastMessagesByDirectChatId).toHaveBeenNthCalledWith(
				1,
				directChatId,
				page,
				take,
			);
		});

		it('should call to target dto method from transform helper to transform each founded message to appropriate dto', async (): Promise<void> => {
			await directChatsService.getChatMessages(userId, directChatId, page, take);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(directChatMessagesMock.length);

			directChatMessagesMock.forEach((message: DirectChatMessage, index: number) => {
				expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(
					index + 1,
					DirectChatMessageWithChatAndUserDto,
					message,
				);
			});
		});

		it('should call decrypt method from decryption strategy manager to decrypt each founded message', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsService.getChatMessages(userId, directChatId, page, take);

			expect(decryptionStrategyManager.decrypt).toHaveBeenCalledTimes(messages.length);

			messages.forEach((message: DirectChatMessageWithChatAndUserDto, index: number) => {
				expect(decryptionStrategyManager.decrypt).toHaveBeenNthCalledWith(index + 1, message);
			});
		});

		it('should return an Array', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsService.getChatMessages(userId, directChatId, page, take);

			expect(messages).toBeInstanceOf(Array);
		});
	});
});
