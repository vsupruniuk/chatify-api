import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IDirectChatRepository } from '@Interfaces/directChats/IDirectChatRepository';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DirectChatsService implements IDirectChatsService {
	constructor(
		@Inject(CustomProviders.I_DIRECT_CHATS_REPOSITORY_PROVIDER)
		private readonly _directChatsRepository: IDirectChatRepository,
	) {}
}
