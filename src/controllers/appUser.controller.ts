import { AccessToken } from '@Decorators/AccessToken.decorator';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { CacheKeys } from '@Enums/CacheKeys.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { IAppUserController } from '@Interfaces/appUser/IAppUserController';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppLogger } from '@Logger/app.logger';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	UnauthorizedException,
	UseGuards,
} from '@nestjs/common';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';

@Controller('app-user')
@UseGuards(AuthGuard)
export class AppUserController implements IAppUserController {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(
		@Inject(CACHE_MANAGER)
		private readonly _cacheManager: Cache,

		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJWTTokensService,
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

		const userFromToken: JWTPayloadDto | null =
			await this._jwtTokensService.verifyAccessToken(accessToken);

		if (!userFromToken) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		const userFromCache: AppUserDto | undefined = await this._cacheManager.get<AppUserDto>(
			CacheKeys.APP_USER + `_${userFromToken.id}`,
		);

		if (userFromCache) {
			responseResult.data = [userFromCache];
			responseResult.dataLength = responseResult.data.length;

			return responseResult;
		}

		const user: AppUserDto | null = await this._usersService.getAppUser(userFromToken.id);

		if (!user) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		await this._cacheManager.set(
			CacheKeys.APP_USER + `_${userFromToken.id}`,
			user,
			Number(process.env.CACHE_TIME_APP_USER),
		);

		responseResult.data = [user];
		responseResult.dataLength = responseResult.data.length;

		this._logger.successfulRequest({ code: responseResult.code, data: responseResult.data });

		return responseResult;
	}
}
