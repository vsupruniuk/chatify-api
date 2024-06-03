import { DirectChatsGateway } from '@Gateways/directChats.gateway';
import {
	directChatsRepositoryProvider,
	directChatsServiceProvider,
} from '@Modules/providers/index';
import { Module } from '@nestjs/common';

@Module({
	providers: [DirectChatsGateway, directChatsServiceProvider, directChatsRepositoryProvider],
})
export class DirectChatsModule {}
