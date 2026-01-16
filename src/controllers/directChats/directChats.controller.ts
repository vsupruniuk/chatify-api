import { Controller, Get, Inject, ParseUUIDPipe, UseInterceptors } from '@nestjs/common';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { JwtPayloadDto } from '@dtos/jwt';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { AppUserPayload, Pagination, QueryRequired } from '@decorators/data';

import { CustomProvider, QueryParam, Route } from '@enums';

import { IDirectChatsController } from '@controllers';

import { IDirectChatMessagesService, IDirectChatsService } from '@services';

import { PaginationTypes } from '@customTypes';

@Controller(Route.DIRECT_CHATS)
@UseInterceptors(AuthInterceptor, ResponseTransformInterceptor)
export class DirectChatsController implements IDirectChatsController {
	constructor(
		@Inject(CustomProvider.CTF_DIRECT_CHATS_SERVICE)
		private readonly _directChatsService: IDirectChatsService,

		@Inject(CustomProvider.CTF_DIRECT_CHAT_MESSAGES_SERVICE)
		private readonly _directChatMessagesService: IDirectChatMessagesService,
	) {}

	@Get()
	public async getLastChats(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
		@Pagination() pagination: PaginationTypes.IPagination,
	): Promise<DirectChatWithUsersAndMessagesDto[]> {
		return await this._directChatsService.getUserLastChats(
			appUserPayload.id,
			pagination.page,
			pagination.take,
		);
	}

	@Get(Route.CHAT_MESSAGES)
	public async getChatMessages(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
		@QueryRequired(QueryParam.CHAT_ID, ParseUUIDPipe) chatId: string,
		@Pagination() pagination: PaginationTypes.IPagination,
	): Promise<DirectChatMessageWithChatAndUserDto[]> {
		return await this._directChatMessagesService.getChatMessages(
			appUserPayload.id,
			chatId,
			pagination.page,
			pagination.take,
		);
	}
}
