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
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';

describe('Direct chats controller', (): void => {
	let directChatsController: DirectChatsController;
	let directChatsService: IDirectChatsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsController,

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

	describe('Get last chats', (): void => {
		const userMock: User = users[2];
		const directChatsMock: DirectChat[] = directChats.slice(1, 3);

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(directChatsService, 'getUserLastChats').mockResolvedValue(
				directChatsMock.map((chat: DirectChat) => {
					return plainToInstance(DirectChatWithUsersAndMessagesDto, chat, {
						excludeExtraneousValues: true,
					});
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsController.getLastChats).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsController.getLastChats).toBeInstanceOf(Function);
		});

		it('should call get user last chats from direct chats service to obtain last chats', async (): Promise<void> => {
			await directChatsController.getLastChats(appUserPayload, page, take);

			expect(directChatsService.getUserLastChats).toHaveBeenCalledTimes(1);
			expect(directChatsService.getUserLastChats).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				page,
				take,
			);
		});

		it('should call get user last chats method without pagination parameters if they were not provided', async (): Promise<void> => {
			await directChatsController.getLastChats(appUserPayload);

			expect(directChatsService.getUserLastChats).toHaveBeenCalledTimes(1);
			expect(directChatsService.getUserLastChats).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				undefined,
				undefined,
			);
		});

		it('should return an Array', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				page,
				take,
			);

			expect(chats).toBeInstanceOf(Array);
		});

		it('should return empty array if no chats were found', async (): Promise<void> => {
			jest.spyOn(directChatsService, 'getUserLastChats').mockResolvedValue([]);

			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				page,
				take,
			);

			expect(chats).toHaveLength(0);
		});

		it('should return all founded chats', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				page,
				take,
			);

			expect(chats.sort()).toEqual(
				directChatsMock
					.map((chat: DirectChat) =>
						plainToInstance(DirectChatWithUsersAndMessagesDto, chat, {
							excludeExtraneousValues: true,
						}),
					)
					.sort(),
			);
		});

		it('should return all founded chats as instance of DirectChatWithUsersAndMessagesDto', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				page,
				take,
			);

			chats.forEach((chat: DirectChatWithUsersAndMessagesDto) => {
				expect(chat).toBeInstanceOf(DirectChatWithUsersAndMessagesDto);
			});
		});
	});
});
