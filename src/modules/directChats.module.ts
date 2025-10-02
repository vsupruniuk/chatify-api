import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { DirectChatsGateway } from '@gateways';

import { DirectChatsController } from '@controllers';

import { providers } from '@modules/providers';

import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';

@Module({
	controllers: [DirectChatsController],
	providers: [
		DirectChatsGateway,
		JwtService,

		DirectChatWithUsersAndMessagesStrategy,
		DirectChatMessageWithChatAndUserStrategy,

		providers.CTF_DIRECT_CHATS_SERVICE,
		providers.CTF_DIRECT_CHATS_REPOSITORY,

		providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

		providers.CTF_CRYPTO_SERVICE,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,

		providers.CTF_USERS_SERVICE,
		providers.CTF_USERS_REPOSITORY,

		providers.CTF_WS_CLIENTS_SERVICE,
		providers.CTF_DECRYPTION_STRATEGY_MANAGER,
	],
})
export class DirectChatsModule {}
