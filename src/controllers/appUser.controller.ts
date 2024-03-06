import { AccessToken } from '@Decorators/AccessToken.decorator';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { IAppUserController } from '@Interfaces/appUser/IAppUserController';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppLogger } from '@Logger/app.logger';
import { Controller, Get, HttpCode, HttpStatus, Inject, UseGuards } from '@nestjs/common';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';

@Controller('app-user')
@UseGuards(AuthGuard)
export class AppUserController implements IAppUserController {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getUser(@AccessToken() accessToken: string): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.getUser.name,
			controller: 'AppUserController',
		});

		const responseResult: SuccessfulResponseResult<AppUserDto> =
			new SuccessfulResponseResult<AppUserDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		// Workflow
		// 1. Decode access token
		// 2. Get user
		// 3. Return user
		console.log(accessToken);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		this._logger.successfulRequest({ code: responseResult.code, data: responseResult.data });

		return responseResult;
	}
}
