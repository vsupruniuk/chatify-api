import { DirectChatsGateway } from '@Gateways/directChats.gateway';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DirectChatsController } from '@Controllers/directChats.controller';
import providers from '@Modules/providers/providers';

@Module({
	controllers: [DirectChatsController],
	providers: [
		DirectChatsGateway,
		JwtService,

		providers.CTF_DIRECT_CHATS_SERVICE,
		providers.CTF_DIRECT_CHATS_REPOSITORY,

		providers.CTF_CRYPTO_SERVICE,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,
	],
})
export class DirectChatsModule {}
