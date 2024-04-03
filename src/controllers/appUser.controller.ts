import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CacheKeys } from '@Enums/CacheKeys.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { FileFields } from '@Enums/FileFields.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { FileHelper } from '@Helpers/file.helper';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IAccountSettingsService } from '@Interfaces/accountSettings/IAccountSettingsService';
import { IAppUserController } from '@Interfaces/appUser/IAppUserController';
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
	Post,
	UnauthorizedException,
	UnprocessableEntityException,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { TUserPayload } from '@Types/users/TUserPayload';
import { Express, Request } from 'express';
import { diskStorage } from 'multer';

@Controller('app-user')
@UseInterceptors(AuthInterceptor)
export class AppUserController implements IAppUserController {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(
		@Inject(CACHE_MANAGER)
		private readonly _cacheManager: Cache,

		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_ACCOUNT_SETTINGS_SERVICE)
		private readonly _accountSettingsService: IAccountSettingsService,
	) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getUser(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.getUser.name,
			controller: 'AppUserController',
		});

		const responseResult: SuccessfulResponseResult<AppUserDto> =
			new SuccessfulResponseResult<AppUserDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		const userFromCache: AppUserDto | undefined = await this._cacheManager.get<AppUserDto>(
			CacheKeys.APP_USER + `_${appUserPayload.id}`,
		);

		if (userFromCache) {
			responseResult.data = [userFromCache];
			responseResult.dataLength = responseResult.data.length;

			return responseResult;
		}

		const user: AppUserDto | null = await this._usersService.getAppUser(appUserPayload.id);

		if (!user) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		await this._cacheManager.set(
			CacheKeys.APP_USER + `_${appUserPayload.id}`,
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
		@AppUserPayload() appUserPayload: JWTPayloadDto,
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

		if (updateAppUserDto.nickname) {
			const userByNickname: UserShortDto | null = await this._usersService.getByNickname(
				updateAppUserDto.nickname,
			);

			if (userByNickname) {
				throw new ConflictException(['User with this nickname already exist|nickname']);
			}
		}

		const isUserUpdated: boolean = await this._usersService.updateUser(
			appUserPayload.id,
			updateAppUserDto,
		);

		if (!isUserUpdated) {
			throw new UnprocessableEntityException([
				'Failed to update user information. Please try again',
			]);
		}

		await this._cacheManager.del(CacheKeys.APP_USER + `_${appUserPayload.id}`);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		this._logger.successfulRequest({ code: responseResult.code, data: responseResult.data });

		return responseResult;
	}

	@Patch('/account-settings')
	@HttpCode(HttpStatus.OK)
	public async updateAccountSettings(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@Body() newSettings: UpdateAccountSettingsDto,
	): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.updateAccountSettings.name,
			controller: 'AppUserController',
			body: newSettings,
		});

		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		if (!newSettings || !Object.keys(newSettings).length) {
			throw new BadRequestException(['At least 1 field to change should be passed']);
		}

		const fullUser: UserFullDto | null = await this._usersService.getFullUserById(
			appUserPayload.id,
		);

		if (!fullUser) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		const isAccountSettingsUpdated = await this._accountSettingsService.updateAccountSettings(
			fullUser.accountSettings.id,
			newSettings,
		);

		if (!isAccountSettingsUpdated) {
			throw new UnprocessableEntityException([
				'Failed to update account settings. Please, try again',
			]);
		}

		await this._cacheManager.del(CacheKeys.APP_USER + `_${fullUser.id}`);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		this._logger.successfulRequest({ code: responseResult.code, data: responseResult.data });

		return responseResult;
	}

	@Post('/upload-avatar')
	@HttpCode(HttpStatus.CREATED)
	@UseInterceptors(
		FileInterceptor(FileFields.USER_AVATAR, {
			fileFilter(
				req: Request & TUserPayload,
				file: Express.Multer.File,
				callback: (error: Error | null, acceptFile: boolean) => void,
			): void {
				FileHelper.validateFileExtension(file, callback);
			},
			limits: { fileSize: 10_485_760, files: 1 },
			storage: diskStorage({
				destination: 'public',
				filename(
					req: Request & TUserPayload,
					file: Express.Multer.File,
					callback: (error: Error | null, filename: string) => void,
				): void {
					FileHelper.renameAndSave(req.user, file, callback);
				},
			}),
		}),
	)
	public async uploadAvatar(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.uploadAvatar.name,
			controller: 'AppUserController',
			body: file,
		});

		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.CREATED,
			ResponseStatus.SUCCESS,
		);

		if (!file) {
			throw new BadRequestException([
				`Provide image file with size less than 10 MB to upload|${FileFields.USER_AVATAR}`,
			]);
		}

		const fullUser: UserFullDto | null = await this._usersService.getFullUserById(
			appUserPayload.id,
		);

		if (!fullUser) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		if (fullUser.avatarUrl) {
			FileHelper.deleteFile(fullUser.avatarUrl);
		}

		const isUserAvatarUrlUpdated: boolean = await this._usersService.updateUser(appUserPayload.id, {
			avatarUrl: file.filename,
		});

		if (!isUserAvatarUrlUpdated) {
			throw new BadRequestException(['Failed to save avatar. Please, try again']);
		}

		await this._cacheManager.del(CacheKeys.APP_USER + `_${appUserPayload.id}`);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		this._logger.successfulRequest({ code: responseResult.code, data: responseResult.data });

		return responseResult;
	}
}
