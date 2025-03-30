import { DirectChatsGateway } from '@gateways/directChats/directChats.gateway';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { DirectChatWithUsersAndMessagesDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesDtoDecryptionStrategy';
import { DirectChatMessageWithChatAndUserDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserDtoDecryptionStrategy';
import { DirectChatsController } from '@controllers/directChats/directChats.controller';

@Module({
	controllers: [DirectChatsController],
	providers: [
		DirectChatsGateway,
		JwtService,

		DirectChatWithUsersAndMessagesDtoDecryptionStrategy,
		DirectChatMessageWithChatAndUserDtoDecryptionStrategy,

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
