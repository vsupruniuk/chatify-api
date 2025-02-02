import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { FileFields } from '@Enums/FileFields.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { FileHelper } from '@Helpers/file.helper';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IAccountSettingsService } from '@Interfaces/accountSettings/IAccountSettingsService';
import { IAppUserController } from '@Interfaces/appUser/IAppUserController';
import { IUsersService } from '@Interfaces/users/IUsersService';
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
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
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_ACCOUNT_SETTINGS_SERVICE)
		private readonly _accountSettingsService: IAccountSettingsService,
	) {}

	@Get()
	@HttpCode(HttpStatus.OK)
	public async getUser(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<AppUserDto> =
			new SuccessfulResponseResult<AppUserDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		const user: AppUserDto | null = await this._usersService.getAppUser(appUserPayload.id);

		if (!user) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		responseResult.data = [user];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Patch()
	@HttpCode(HttpStatus.OK)
	public async updateUser(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@Body() updateAppUserDto: UpdateAppUserDto,
	): Promise<ResponseResult> {
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

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Patch('/account-settings')
	@HttpCode(HttpStatus.OK)
	public async updateAccountSettings(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@Body() newSettings: UpdateAccountSettingsDto,
	): Promise<ResponseResult> {
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

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/user-avatar')
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
			throw new UnprocessableEntityException(['Failed to save avatar. Please, try again']);
		}

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Delete('user-avatar')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deleteAvatar(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.NO_CONTENT,
			ResponseStatus.SUCCESS,
		);

		const fullUser: UserFullDto | null = await this._usersService.getFullUserById(
			appUserPayload.id,
		);

		if (!fullUser) {
			throw new UnauthorizedException(['Please, login to perform this action']);
		}

		if (!fullUser.avatarUrl) {
			throw new NotFoundException(['User does not have saved avatar|user-avatar']);
		}

		FileHelper.deleteFile(fullUser.avatarUrl);

		const isUpdated: boolean = await this._usersService.updateUser(fullUser.id, {
			avatarUrl: null,
		});

		if (!isUpdated) {
			throw new UnprocessableEntityException(['Failed to delete avatar, please try again']);
		}

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}
}
