import { DirectChatsGateway } from '@gateways/directChats.gateway';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';

@Module({
	controllers: [
		//DirectChatsController
	],
	providers: [
		DirectChatsGateway,
		JwtService,

		providers.CTF_DIRECT_CHATS_SERVICE,
		providers.CTF_DIRECT_CHATS_REPOSITORY,

		providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

		providers.CTF_CRYPTO_SERVICE,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,
	],
})
export class DirectChatsModule {}
