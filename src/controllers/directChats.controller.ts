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
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { ResponseResult } from '@Responses/ResponseResult';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatsList.dto';

@Controller('direct-chats')
@UseInterceptors(AuthInterceptor)
export class DirectChatsController implements IDirectChatsController {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(
		@Inject(CustomProviders.I_DIRECT_CHATS_SERVICE_PROVIDER)
		private readonly _directChatsService: IDirectChatsService,
	) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getLastChats(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.getLastChats.name,
			controller: 'DirectChatsController',
			queryParams: {
				page,
				take,
			},
		});

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
}
