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

import { CustomProvider, WSEvent } from '@enums';

import { User, DirectChat, DirectChatMessage } from '@entities';

import { users, directChats, directChatsMessages } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';
import { CreateDirectChatRequestDto, DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

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
		directChatsService = moduleFixture.get(CustomProvider.CTF_DIRECT_CHATS_SERVICE);
		wsClientsService = moduleFixture.get(CustomProvider.CTF_WS_CLIENTS_SERVICE);
	});

	describe('Create direct chat', (): void => {
		const userMock: User = users[0];
		const receiverMock: User = users[1];
		const directChatMock: DirectChat = directChats[2];
		const directChatMessageMock: DirectChatMessage = directChatsMessages[2];

		const createdDirectChatMock: DirectChatWithUsersAndMessagesDto = plainToInstance(
			DirectChatWithUsersAndMessagesDto,
			{
				...directChatMock,
				users: [{ ...userMock }, { ...receiverMock }],
				messages: [{ ...directChatMessageMock }],
			},
			{
				excludeExtraneousValues: true,
			},
		);

		const appUserPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const createDirectChatRequestDto: CreateDirectChatRequestDto = {
			receiverId: receiverMock.id,
			messageText: 'Hello, world!',
		};

		beforeEach((): void => {
			jest.spyOn(directChatsService, 'createChat').mockResolvedValue(createdDirectChatMock);
			jest.spyOn(wsClientsService, 'notifyAllClients').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
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
				WSEvent.ON_CREATE_CHAT,
				createdDirectChatMock,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await directChatsGateway.createDirectChat(
				appUserPayload,
				createDirectChatRequestDto,
			);

			expect(result).toBeUndefined();
		});
	});
});
