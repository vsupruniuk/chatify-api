import { DirectChatsGateway } from '@gateways/directChats/directChats.gateway';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import * as wsAuthModule from '@middlewares/wsAuth.middleware';
import Mock = jest.Mock;

describe('Direct chats gateway', (): void => {
	let directChatsGateway: DirectChatsGateway;

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
	});

	describe('After init', (): void => {
		const client: Socket = { use: jest.fn() } as unknown as Socket;

		const authMiddlewareMock: Mock = jest.fn();

		beforeEach((): void => {
			jest.spyOn(wsAuthModule, 'WsAuthMiddleware').mockReturnValue(authMiddlewareMock);
		});

		it('should be defined', (): void => {
			expect(directChatsGateway.afterInit).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsGateway.afterInit).toBeInstanceOf(Function);
		});

		it('should use ws auth middleware to create authentication middleware and apply it for clients', (): void => {
			directChatsGateway.afterInit(client);

			expect(client.use).toHaveBeenCalledTimes(1);
			expect(client.use).toHaveBeenNthCalledWith(1, authMiddlewareMock);
		});
	});
});
