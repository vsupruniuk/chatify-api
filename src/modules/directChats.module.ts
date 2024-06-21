import { DirectChatsGateway } from '@Gateways/directChats.gateway';
import {
	cryptoServiceProvider,
	directChatsRepositoryProvider,
	directChatsServiceProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
} from '@Modules/providers';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
	providers: [
		DirectChatsGateway,
		JwtService,
		directChatsServiceProvider,
		directChatsRepositoryProvider,
		cryptoServiceProvider,
		jwtTokensServiceProvider,
		jwtTokensRepositoryProvider,
	],
})
export class DirectChatsModule {}
