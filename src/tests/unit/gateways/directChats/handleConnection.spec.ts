import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { DirectChatsGateway } from '@gateways';

import { providers } from '@modules/providers';

import { IWSClientsService } from '@services';
import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';

import { CustomProviders } from '@enums';

import { GlobalTypes } from '@customTypes';

import { User } from '@entities';

import { users } from '@testMocks';

import { JWTPayloadDto } from '@dtos/jwt';

describe('Direct chats gateway', (): void => {
	let directChatsGateway: DirectChatsGateway;
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
		wsClientsService = moduleFixture.get(CustomProviders.CTF_WS_CLIENTS_SERVICE);
	});

	describe('Handle connection', (): void => {
		const userMock: User = users[4];

		const client: GlobalTypes.TAuthorizedSocket = {
			user: plainToInstance(JWTPayloadDto, userMock, { excludeExtraneousValues: true }),
		} as GlobalTypes.TAuthorizedSocket;

		beforeEach((): void => {
			jest.spyOn(wsClientsService, 'set');
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call set method from ws clients service to save a connection', (): void => {
			directChatsGateway.handleConnection(client);

			expect(wsClientsService.set).toHaveBeenCalledTimes(1);
			expect(wsClientsService.set).toHaveBeenNthCalledWith(1, client.user.id, client);
		});
	});
});
