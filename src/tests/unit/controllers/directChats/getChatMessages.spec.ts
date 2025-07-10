import { DirectChatsController } from '@controllers/directChats/directChats.controller';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { IDirectChatsService } from '@services/directChats/IDirectChatsService';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { DataSource } from 'typeorm';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { plainToInstance } from 'class-transformer';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';

describe('Direct chats controller', (): void => {
	let directChatsController: DirectChatsController;
	let directChatsService: IDirectChatsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [DirectChatsController],
			providers: [
				DirectChatMessageWithChatAndUserStrategy,
				DirectChatWithUsersAndMessagesStrategy,

				JwtService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_DIRECT_CHATS_SERVICE,
				providers.CTF_DIRECT_CHATS_REPOSITORY,

				providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

				providers.CTF_CRYPTO_SERVICE,

				providers.CTF_DECRYPTION_STRATEGY_MANAGER,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		directChatsController = moduleFixture.get(DirectChatsController);
		directChatsService = moduleFixture.get(CustomProviders.CTF_DIRECT_CHATS_SERVICE);
	});

	describe('Get chat messages', (): void => {
		const userMock: User = users[2];
		const directChatMock: DirectChat = directChats[0];
		const directChatMessagesMock: DirectChatMessage[] = directChatsMessages.slice(0, 2);

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const chatId: string = directChatMock.id;
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(directChatsService, 'getChatMessages').mockResolvedValue(
				directChatMessagesMock.map((message: DirectChatMessage) => {
					return plainToInstance(DirectChatMessageWithChatAndUserDto, message, {
						excludeExtraneousValues: true,
					});
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsController.getChatMessages).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsController.getChatMessages).toBeInstanceOf(Function);
		});

		it('should call get chat messages method from direct chats service to get chat messages', async (): Promise<void> => {
			await directChatsController.getChatMessages(appUserPayload, chatId, page, take);

			expect(directChatsService.getChatMessages).toHaveBeenCalledTimes(1);
			expect(directChatsService.getChatMessages).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				chatId,
				page,
				take,
			);
		});

		it('should call get chat messages method without pagination parameters if they were not provided', async (): Promise<void> => {
			await directChatsController.getChatMessages(appUserPayload, chatId);

			expect(directChatsService.getChatMessages).toHaveBeenCalledTimes(1);
			expect(directChatsService.getChatMessages).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				chatId,
				undefined,
				undefined,
			);
		});

		it('should return an Array', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, page, take);

			expect(messages).toBeInstanceOf(Array);
		});

		it('should return empty array if no messages were found', async (): Promise<void> => {
			jest.spyOn(directChatsService, 'getChatMessages').mockResolvedValue([]);

			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, page, take);

			expect(messages).toHaveLength(0);
		});

		it('should return all founded messages', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, page, take);

			expect(messages.sort()).toEqual(
				directChatMessagesMock
					.map((message: DirectChatMessage) =>
						plainToInstance(DirectChatMessageWithChatAndUserDto, message, {
							excludeExtraneousValues: true,
						}),
					)
					.sort(),
			);
		});

		it('should return all founded messages as instance of DirectChatMessageWithChatAndUserDto', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, page, take);

			messages.forEach((message: DirectChatMessageWithChatAndUserDto) => {
				expect(message).toBeInstanceOf(DirectChatMessageWithChatAndUserDto);
			});
		});
	});
});
