import { DirectChatsGateway } from '@gateways/directChats/directChats.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import { JwtService } from '@nestjs/jwt';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsService } from '@services/directChats/IDirectChatsService';
import { IWSClientsService } from '@services/wsClients/IWSClientsService';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { CreateDirectChatRequestDto } from '@dtos/directChats/CreateDirectChatRequest.dto';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { WSEvents } from '@enums/WSEvents.enum';

describe('Direct chats gateway', (): void => {
	let directChatsGateway: DirectChatsGateway;
	let directChatsService: IDirectChatsService;
	let wsClientsService: IWSClientsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsGateway,

				DirectChatWithUsersAndMessagesStrategy,
				DirectChatMessageWithChatAndUserStrategy,

				JwtService,

				providers.CTF_DIRECT_CHATS_SERVICE,
				providers.CTF_DIRECT_CHATS_REPOSITORY,

				providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_DECRYPTION_STRATEGY_MANAGER,

				providers.CTF_CRYPTO_SERVICE,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_WS_CLIENTS_SERVICE,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		directChatsGateway = moduleFixture.get(DirectChatsGateway);
		directChatsService = moduleFixture.get(CustomProviders.CTF_DIRECT_CHATS_SERVICE);
		wsClientsService = moduleFixture.get(CustomProviders.CTF_WS_CLIENTS_SERVICE);
	});

	describe('Create direct chat', (): void => {
		const userMock: User = users[0];
		const receiverMock: User = users[1];
		const directChatMock: DirectChat = directChats[2];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const createDirectChatRequestDto: CreateDirectChatRequestDto = {
			receiverId: receiverMock.id,
			messageText: 'Hello, world!',
		};

		beforeEach((): void => {
			jest.spyOn(directChatsService, 'createChat').mockResolvedValue(
				plainToInstance(DirectChatWithUsersAndMessagesDto, directChatMock, {
					excludeExtraneousValues: true,
				}),
			);
			jest.spyOn(wsClientsService, 'notifyAllClients').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatsGateway.createDirectChat).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsGateway.createDirectChat).toBeInstanceOf(Function);
		});

		it('should call create chat method from direct chats service to create a chat', async (): Promise<void> => {
			await directChatsGateway.createDirectChat(appUserPayload, createDirectChatRequestDto);

			expect(directChatsService.createChat).toHaveBeenCalledTimes(1);
			expect(directChatsService.createChat).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				createDirectChatRequestDto.receiverId,
				createDirectChatRequestDto.messageText,
			);
		});

		it('should call notify all clients method from ws clients service to notify all connected users about new chat', async (): Promise<void> => {
			await directChatsGateway.createDirectChat(appUserPayload, createDirectChatRequestDto);

			expect(wsClientsService.notifyAllClients).toHaveBeenCalledTimes(1);
			expect(wsClientsService.notifyAllClients).toHaveBeenNthCalledWith(
				1,
				[appUserPayload.id, createDirectChatRequestDto.receiverId],
				WSEvents.ON_CREATE_CHAT,
				plainToInstance(DirectChatWithUsersAndMessagesDto, directChatMock, {
					excludeExtraneousValues: true,
				}),
			);
		});
	});
});
