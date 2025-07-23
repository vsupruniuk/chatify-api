import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import {
	Controller,
	Get,
	Inject,
	ParseIntPipe,
	ParseUUIDPipe,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { AppUserPayload } from '@decorators/data/AppUserPayload.decorator';
import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsController } from '@controllers/directChats/IDirectChatsController';
import { IDirectChatsService } from '@services/directChats/IDirectChatsService';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { QueryRequired } from '@decorators/data/QueryRequired.decorator';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';

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
