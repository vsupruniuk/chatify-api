import {
	Controller,
	Get,
	Inject,
	ParseIntPipe,
	ParseUUIDPipe,
	Query,
	UseInterceptors,
} from '@nestjs/common';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { JWTPayloadDto } from '@dtos/jwt';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { AppUserPayload, QueryRequired } from '@decorators/data';

import { CustomProviders } from '@enums';

import { IDirectChatsController } from '@controllers';

import { IDirectChatsService } from '@services';

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

		@Query('page', new ParseIntPipe({ optional: true })) page?: number,

		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<DirectChatWithUsersAndMessagesDto[]> {
		return await this._directChatsService.getUserLastChats(appUserPayload.id, page, take);
	}

	@Get('chat-messages')
	public async getChatMessages(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@QueryRequired('chatId', ParseUUIDPipe) chatId: string,

		@Query('page', new ParseIntPipe({ optional: true })) page?: number,

		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<DirectChatMessageWithChatAndUserDto[]> {
		return await this._directChatsService.getChatMessages(appUserPayload.id, chatId, page, take);
	}
}
