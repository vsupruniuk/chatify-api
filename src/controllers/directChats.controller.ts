import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	ParseIntPipe,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { IDirectChatsController } from '@Interfaces/directChats/IDirectChatsController';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';
import { QueryRequired } from '@Decorators/QueryRequired.decorator';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';
import { TransformInterceptor } from '@Interceptors/transform.interceptor';

@Controller('direct-chats')
@UseInterceptors(AuthInterceptor)
@UseInterceptors(TransformInterceptor)
export class DirectChatsController implements IDirectChatsController {
	constructor(
		@Inject(CustomProviders.CTF_DIRECT_CHATS_SERVICE)
		private readonly _directChatsService: IDirectChatsService,
	) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getLastChats(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<DirectChatShortDto[]> {
		return await this._directChatsService.getLastChats(appUserPayload.id, page, take);
	}

	@Get('chat-messages')
	@HttpCode(HttpStatus.OK)
	public async getChatMessages(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@QueryRequired('chatId') chatId: string,
		page?: number,
		take?: number,
	): Promise<DirectChatMessageWithChatDto[]> {
		return await this._directChatsService.getChatMessages(appUserPayload.id, chatId, page, take);
	}
}
