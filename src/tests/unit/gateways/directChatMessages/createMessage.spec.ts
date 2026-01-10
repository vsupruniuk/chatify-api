import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { DirectChatMessagesGateway } from '@gateways';

import { providers } from '@modules/providers';

import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';
import { IDirectChatMessagesService, IWSClientsService } from '@services';

import { CustomProvider, WSEvent } from '@enums';

import { User, DirectChat, DirectChatMessage } from '@entities';

import { users, directChats, directChatsMessages } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';
import {
	CreateDirectChatMessageRequestDto,
	DirectChatMessageWithChatAndUserDto,
} from '@dtos/directChatMessages';

describe('Direct chat messages gateway', (): void => {
	let directChatMessagesGateway: DirectChatMessagesGateway;
	let directChatMessagesService: IDirectChatMessagesService;
	let wsClientsService: IWSClientsService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatMessagesGateway,

				DirectChatWithUsersAndMessagesStrategy,
				DirectChatMessageWithChatAndUserStrategy,

				JwtService,

				providers.CTF_DIRECT_CHATS_REPOSITORY,

				providers.CTF_DIRECT_CHAT_MESSAGES_SERVICE,
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

		directChatMessagesGateway = moduleFixture.get(DirectChatMessagesGateway);
		directChatMessagesService = moduleFixture.get(CustomProvider.CTF_DIRECT_CHAT_MESSAGES_SERVICE);
		wsClientsService = moduleFixture.get(CustomProvider.CTF_WS_CLIENTS_SERVICE);
	});

	describe('Create message', (): void => {
		const userMock: User = users[3];
		const receiverMock: User = users[4];
		const directChatMock: DirectChat = directChats[1];
		const directChatMessageMock: DirectChatMessage = directChatsMessages[1];

		const createdMessageMock: DirectChatMessageWithChatAndUserDto = plainToInstance(
			DirectChatMessageWithChatAndUserDto,
			{
				...directChatMessageMock,
				directChat: {
					...directChatMock,
					users: [{ ...userMock }, { ...receiverMock }],
				},
			},
			{ excludeExtraneousValues: true },
		);

		const appUserPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const sendDirectChatMessageRequestDto: CreateDirectChatMessageRequestDto = {
			messageText: 'Hello, world',
			directChatId: directChatMock.id,
		};

		beforeEach((): void => {
			jest.spyOn(directChatMessagesService, 'createMessage').mockResolvedValue(createdMessageMock);

			jest.spyOn(wsClientsService, 'notifyAllClients');
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		it('should call create message method from direct chats service to create a new message in chat', async (): Promise<void> => {
			await directChatMessagesGateway.createMessage(
				appUserPayload,
				sendDirectChatMessageRequestDto,
			);

			expect(directChatMessagesService.createMessage).toHaveBeenCalledTimes(1);
			expect(directChatMessagesService.createMessage).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				sendDirectChatMessageRequestDto.directChatId,
				sendDirectChatMessageRequestDto.messageText,
			);
		});

		it('should call notify all clients method from ws clients service to notify all connected users about new message', async (): Promise<void> => {
			await directChatMessagesGateway.createMessage(
				appUserPayload,
				sendDirectChatMessageRequestDto,
			);

			expect(wsClientsService.notifyAllClients).toHaveBeenCalledTimes(1);
			expect(wsClientsService.notifyAllClients).toHaveBeenNthCalledWith(
				1,
				[userMock.id, receiverMock.id],
				WSEvent.ON_RECEIVE_MESSAGE,
				createdMessageMock,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await directChatMessagesGateway.createMessage(
				appUserPayload,
				sendDirectChatMessageRequestDto,
			);

			expect(result).toBeUndefined();
		});
	});
});
