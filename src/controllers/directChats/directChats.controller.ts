import { Controller, Get, Inject, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { JWTPayloadDto } from '@dtos/jwt';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { AppUserPayload, Pagination, QueryRequired } from '@decorators/data';

import { CustomProviders } from '@enums';

import { IDirectChatsController } from '@controllers';

import { IDirectChatsService } from '@services';
import { GlobalTypes } from '@customTypes';

@Controller('direct-chats')
@UseInterceptors(AuthInterceptor)
@UseInterceptors(ResponseTransformInterceptor)
export class DirectChatsController implements IDirectChatsController {
	constructor(
		@Inject(CustomProviders.CTF_DIRECT_CHATS_SERVICE)
		private readonly _directChatsService: IDirectChatsService,
	) {}

	@Get()
	public async getLastChats(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@Pagination() pagination: GlobalTypes.IPagination,
	): Promise<DirectChatWithUsersAndMessagesDto[]> {
		return await this._directChatsService.getUserLastChats(
			appUserPayload.id,
			pagination.page,
			pagination.take,
		);
	}

	@Get('chat-messages')
	public async getChatMessages(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@QueryRequired('chatId', ParseUUIDPipe) chatId: string,

		@Pagination() pagination: GlobalTypes.IPagination,
	): Promise<DirectChatMessageWithChatAndUserDto[]> {
		return await this._directChatsService.getChatMessages(
			appUserPayload.id,
			chatId,
			pagination.page,
			pagination.take,
		);
	}
}
