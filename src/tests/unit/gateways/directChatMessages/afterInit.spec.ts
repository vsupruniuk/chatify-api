import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { Socket } from 'socket.io';

import { DirectChatMessagesGateway } from '@gateways';

import { providers } from '@modules/providers';

import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';

import * as wsAuthModule from '@middlewares/wsAuthMiddleware';

describe('Direct chat messages gateway', (): void => {
	let directChatMessagesGateway: DirectChatMessagesGateway;

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
	});

	describe('After init', (): void => {
		const client: Socket = { use: jest.fn() } as unknown as Socket;

		const authMiddlewareMock: jest.Mock = jest.fn();

		beforeEach((): void => {
			jest.spyOn(wsAuthModule, 'wsAuthMiddleware').mockReturnValue(authMiddlewareMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should use ws auth middleware to create authentication middleware and apply it for clients', (): void => {
			directChatMessagesGateway.afterInit(client);

			expect(client.use).toHaveBeenCalledTimes(1);
			expect(client.use).toHaveBeenNthCalledWith(1, authMiddlewareMock);
		});
	});
});
