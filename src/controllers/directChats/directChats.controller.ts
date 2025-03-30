import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { Controller, Get, Inject, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { AppUserPayload } from '@decorators/data/AppUser.decorator';
import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsController } from '@controllers/directChats/IDirectChatsController';
import { IDirectChatsService } from '@services/directChats/IDirectChatsService';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

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
	//
	// 	// TODO check if needed
	// 	@Get('chat-messages')
	// 	@HttpCode(HttpStatus.OK)
	// 	public async getChatMessages(
	// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
	// 		@QueryRequired('chatId') chatId: string,
	// 		page?: number,
	// 		take?: number,
	// 	): Promise<DirectChatMessageWithChatDto[]> {
	// 		return await this._directChatsService.getChatMessages(appUserPayload.id, chatId, page, take);
	// 	}
}
