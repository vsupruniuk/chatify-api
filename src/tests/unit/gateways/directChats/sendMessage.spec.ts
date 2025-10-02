import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { DirectChatsGateway } from '@gateways';

import { providers } from '@modules/providers';

import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';
import { IDirectChatsService, IWSClientsService } from '@services';

import { CustomProviders, WSEvents } from '@enums';

import { User, DirectChat, DirectChatMessage } from '@entities';

import { users, directChats, directChatsMessages } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';
import {
	SendDirectChatMessageRequestDto,
	DirectChatMessageWithChatAndUserDto,
} from '@dtos/directChatMessages';

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

	describe('Send message', (): void => {
		const userMock: User = users[3];
		const receiverMock: User = users[4];
		const directChatMock: DirectChat = directChats[1];
		const directChatMessageMock: DirectChatMessage = directChatsMessages[1];

		const appUserPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const sendDirectChatMessageRequestDto: SendDirectChatMessageRequestDto = {
			messageText: 'Hello, world',
			directChatId: directChatMock.id,
		};

		beforeEach((): void => {
			jest.spyOn(directChatsService, 'sendMessage').mockResolvedValue(
				plainToInstance(
					DirectChatMessageWithChatAndUserDto,
					{
						...directChatMessageMock,
						directChat: {
							...directChatMock,
							users: [{ ...userMock }, { ...receiverMock }],
						},
					},
					{ excludeExtraneousValues: true },
				),
			);
			jest.spyOn(wsClientsService, 'notifyAllClients');
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		it('should call send message method from direct chats service to create a new message in chat', async (): Promise<void> => {
			await directChatsGateway.sendMessage(appUserPayload, sendDirectChatMessageRequestDto);

			expect(directChatsService.sendMessage).toHaveBeenCalledTimes(1);
			expect(directChatsService.sendMessage).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				sendDirectChatMessageRequestDto.directChatId,
				sendDirectChatMessageRequestDto.messageText,
			);
		});

		it('should call notify all clients method from ws clients service to notify all connected users about new message', async (): Promise<void> => {
			await directChatsGateway.sendMessage(appUserPayload, sendDirectChatMessageRequestDto);

			expect(wsClientsService.notifyAllClients).toHaveBeenCalledTimes(1);
			expect(wsClientsService.notifyAllClients).toHaveBeenNthCalledWith(
				1,
				[userMock.id, receiverMock.id],
				WSEvents.ON_RECEIVE_MESSAGE,
				plainToInstance(
					DirectChatMessageWithChatAndUserDto,
					{
						...directChatMessageMock,
						directChat: {
							...directChatMock,
							users: [{ ...userMock }, { ...receiverMock }],
						},
					},
					{ excludeExtraneousValues: true },
				),
			);
		});
	});
});
