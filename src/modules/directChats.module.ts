import { DirectChatsGateway } from '@Gateways/directChats.gateway';
import {
	cryptoServiceProvider,
	directChatsRepositoryProvider,
	directChatsServiceProvider,
} from '@Modules/providers';
import { Module } from '@nestjs/common';

@Module({
	providers: [
		DirectChatsGateway,
		directChatsServiceProvider,
		directChatsRepositoryProvider,
		cryptoServiceProvider,
	],
})
export class DirectChatsModule {}
