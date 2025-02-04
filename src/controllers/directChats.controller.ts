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
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { ResponseResult } from '@Responses/ResponseResult';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';
import { QueryRequired } from '@Decorators/QueryRequired.decorator';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';

@Controller('direct-chats')
@UseInterceptors(AuthInterceptor)
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
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<DirectChatShortDto> =
			new SuccessfulResponseResult<DirectChatShortDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		responseResult.data = await this._directChatsService.getLastChats(
			appUserPayload.id,
			page,
			take,
		);
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Get('chat-messages')
	@HttpCode(HttpStatus.OK)
	public async getChatMessages(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@QueryRequired('chatId') chatId: string,
		page?: number,
		take?: number,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<DirectChatMessageWithChatDto> =
			new SuccessfulResponseResult<DirectChatMessageWithChatDto>(
				HttpStatus.OK,
				ResponseStatus.SUCCESS,
			);

		responseResult.data = await this._directChatsService.getChatMessages(
			appUserPayload.id,
			chatId,
			page,
			take,
		);
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}
}
