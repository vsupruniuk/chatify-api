import { DirectChatsService } from '@services/directChats/directChats.service';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { plainToInstance } from 'class-transformer';
import { directChats } from '@testMocks/DirectChat/directChats';
import { users } from '@testMocks/User/users';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { DirectChat } from '@entities/DirectChat.entity';
import { PaginationHelper } from '@helpers/pagination.helper';
import { IDirectChatsRepository } from '@repositories/directChats/IDirectChatsRepository';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { TransformHelper } from '@helpers/transform.helper';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';

describe('Direct chats service', (): void => {
	let directChatsService: DirectChatsService;
	let directChatsRepository: IDirectChatsRepository;
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
		decryptionStrategyManager = moduleFixture.get(CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER);
	});

	describe('Get user last chats', (): void => {
		const userId: string = users[2].id;
		const page: number = 0;
		const take: number = 10;

		const lastChatsMock: DirectChat[] = [
			{
				...directChats[2],
				users: users.slice(2, 4),
				messages: directChatsMessages.slice(2, 4),
			},
		];

		beforeEach((): void => {
			jest.spyOn(TransformHelper, 'toTargetDto');
			jest.spyOn(PaginationHelper, 'toSQLPagination').mockReturnValue({ skip: page, take });
			jest.spyOn(directChatsRepository, 'findLastChatsByUserId').mockResolvedValue(lastChatsMock);
			jest.spyOn(decryptionStrategyManager, 'decrypt').mockImplementation(async (data: object) => {
				return plainToInstance(DirectChatWithUsersAndMessagesDto, data, {
					excludeExtraneousValues: true,
				});
			});
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsService.getUserLastChats).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.getUserLastChats).toBeInstanceOf(Function);
		});

		it('should call to sql pagination method from pagination helper to create pagination parameters for repository method', async (): Promise<void> => {
			await directChatsService.getUserLastChats(userId, page, take);

			expect(PaginationHelper.toSQLPagination).toHaveBeenCalledTimes(1);
			expect(PaginationHelper.toSQLPagination).toHaveBeenNthCalledWith(1, page, take);
		});

		it('should call find last chats by user id to get user last chats', async (): Promise<void> => {
			await directChatsService.getUserLastChats(userId, page, take);

			expect(directChatsRepository.findLastChatsByUserId).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.findLastChatsByUserId).toHaveBeenNthCalledWith(
				1,
				userId,
				page,
				take,
			);
		});

		it('should call to target dto method from transform helper to transform all chats to appropriate dto', async (): Promise<void> => {
			await directChatsService.getUserLastChats(userId, page, take);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(lastChatsMock.length);

			lastChatsMock.forEach((chat: DirectChat, index: number) => {
				expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(
					index + 1,
					DirectChatWithUsersAndMessagesDto,
					chat,
				);
			});
		});

		it('should call decrypt method from decryption strategy manager to decrypt all chats messages', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsService.getUserLastChats(
				userId,
				page,
				take,
			);

			expect(decryptionStrategyManager.decrypt).toHaveBeenCalledTimes(chats.length);

			chats.forEach((chat: DirectChatWithUsersAndMessagesDto, index: number) => {
				expect(decryptionStrategyManager.decrypt).toHaveBeenNthCalledWith(index + 1, chat);
			});
		});

		it('should return an array', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsService.getUserLastChats(
				userId,
				page,
				take,
			);

			expect(chats).toBeInstanceOf(Array);
		});
	});
});
