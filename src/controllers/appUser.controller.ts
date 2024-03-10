import { AccessToken } from '@Decorators/AccessToken.decorator';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CacheKeys } from '@Enums/CacheKeys.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthGuard } from '@Guards/auth.guard';
import { IAppUserController } from '@Interfaces/appUser/IAppUserController';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppLogger } from '@Logger/app.logger';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Patch,
	UnauthorizedException,
	UnprocessableEntityException,
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

	@Patch()
	@HttpCode(HttpStatus.OK)
	public async updateUser(
		@AccessToken() accessToken: string,
		@Body() updateAppUserDto: UpdateAppUserDto,
	): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.updateUser.name,
			controller: 'AppUserController',
			body: updateAppUserDto,
		});

		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		if (!updateAppUserDto || !Object.keys(updateAppUserDto).length) {
			throw new BadRequestException(['At least 1 field to change should be passed']);
		}

		const userFromToken: JWTPayloadDto | null =
			await this._jwtTokensService.verifyAccessToken(accessToken);

		if (!userFromToken) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		if (updateAppUserDto.nickname) {
			const userByNickname: UserShortDto | null = await this._usersService.getByNickname(
				updateAppUserDto.nickname,
			);

			if (userByNickname) {
				throw new ConflictException(['User with this nickname already exist|nickname']);
			}
		}

		const isUserUpdated: boolean = await this._usersService.updateUser(
			userFromToken.id,
			updateAppUserDto,
		);

		if (!isUserUpdated) {
			throw new UnprocessableEntityException([
				'Failed to update user information. Please try again',
			]);
		}

		await this._cacheManager.del(CacheKeys.APP_USER + `_${userFromToken.id}`);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}
}
