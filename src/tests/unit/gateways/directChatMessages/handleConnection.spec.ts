import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { DirectChatMessagesGateway } from '@gateways';

import { providers } from '@modules/providers';

import { IWSClientsService } from '@services';
import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';

import { CustomProvider } from '@enums';

import { AuthTypes } from '@customTypes';

import { User } from '@entities';

import { users } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';

describe('Direct chat messages gateway', (): void => {
	let directChatMessagesGateway: DirectChatMessagesGateway;
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
		wsClientsService = moduleFixture.get(CustomProvider.CTF_WS_CLIENTS_SERVICE);
	});

	describe('Handle connection', (): void => {
		const userMock: User = users[4];

		const client: AuthTypes.TAuthorizedSocket = {
			user: plainToInstance(JwtPayloadDto, userMock, { excludeExtraneousValues: true }),
		} as AuthTypes.TAuthorizedSocket;

		beforeEach((): void => {
			jest.spyOn(wsClientsService, 'set');
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call set method from ws clients service to save a connection', (): void => {
			directChatMessagesGateway.handleConnection(client);

			expect(wsClientsService.set).toHaveBeenCalledTimes(1);
			expect(wsClientsService.set).toHaveBeenNthCalledWith(1, client.user.id, client);
		});
	});
});
