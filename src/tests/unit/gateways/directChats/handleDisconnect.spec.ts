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
import { IWSClientsService } from '@services';

import { CustomProvider } from '@enums';

import { AuthTypes } from '@customTypes';

import { User } from '@entities';

import { users } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';

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
		wsClientsService = moduleFixture.get(CustomProvider.CTF_WS_CLIENTS_SERVICE);
	});

	describe('Handle disconnect', (): void => {
		const userMock: User = users[4];

		const client: AuthTypes.TAuthorizedSocket = {
			user: plainToInstance(JwtPayloadDto, userMock, { excludeExtraneousValues: true }),
		} as AuthTypes.TAuthorizedSocket;

		beforeEach((): void => {
			jest.spyOn(wsClientsService, 'delete');
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call delete method from ws clients service to delete saved connection', (): void => {
			directChatsGateway.handleDisconnect(client);

			expect(wsClientsService.delete).toHaveBeenCalledTimes(1);
			expect(wsClientsService.delete).toHaveBeenNthCalledWith(1, client.user.id);
		});
	});
});
