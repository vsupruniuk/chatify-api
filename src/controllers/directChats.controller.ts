import { Controller, Get, HttpCode, HttpStatus, Inject, UseInterceptors } from '@nestjs/common';
import { IDirectChatController } from '@Interfaces/directChats/IDirectChatController';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';

@Controller('direct-chats')
@UseInterceptors(AuthInterceptor)
export class DirectChatsController implements IDirectChatController {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(
		@Inject(CustomProviders.I_DIRECT_CHATS_SERVICE_PROVIDER)
		private readonly _directChatsService: IDirectChatsService,
	) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getLastChats() {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		await this._directChatsService.getChats();

		return responseResult;
	}
}
