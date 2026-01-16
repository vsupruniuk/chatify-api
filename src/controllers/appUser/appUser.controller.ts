import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { IAppUserController } from '@controllers';

import { JwtPayloadDto } from '@dtos/jwt';
import { UpdateAppUserRequestDto } from '@dtos/appUser';
import {
	AccountSettingsDto,
	UpdateAccountSettingsRequestDto,
} from '@dtos/accountSettings/accountSettings';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar';
import { UserWithAccountSettingsDto } from '@dtos/users';

import { AppUserPayload } from '@decorators/data';

import { CustomProvider, FileField, Route } from '@enums';

import { DtoNotEmptyPipe } from '@pipes';

import { IAccountSettingsService, IAppUserService, IUsersService } from '@services';

import { AuthTypes } from '@customTypes';

import { FileHelper } from '@helpers';

import { filesConfig } from '@configs';

@Controller(Route.APP_USER)
@UseInterceptors(AuthInterceptor, ResponseTransformInterceptor)
export class AppUserController implements IAppUserController {
	constructor(
		@Inject(CustomProvider.CTF_APP_USER_SERVICE)
		private readonly _appUserService: IAppUserService,

		@Inject(CustomProvider.CTF_ACCOUNT_SETTINGS_SERVICE)
		private readonly _accountSettingsService: IAccountSettingsService,

		@Inject(CustomProvider.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get()
	public async getAppUser(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
	): Promise<UserWithAccountSettingsDto> {
		return await this._appUserService.getAppUser(appUserPayload.id);
	}

	@Patch()
	public async updateUser(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
		@Body(DtoNotEmptyPipe) updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<UserWithAccountSettingsDto> {
		return this._appUserService.updateAppUser(appUserPayload, updateAppUserDto);
	}

	@Patch(Route.ACCOUNT_SETTINGS)
	public async updateAccountSettings(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
		@Body(DtoNotEmptyPipe) updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto> {
		return this._accountSettingsService.updateAccountSettings(
			appUserPayload.id,
			updateAccountSettingsRequestDto,
		);
	}

	@UseInterceptors(
		FileInterceptor(FileField.USER_AVATAR, {
			fileFilter(
				_req: AuthTypes.TAuthorizedRequest,
				file: Express.Multer.File,
				callback: (error: Error | null, acceptFile: boolean) => void,
			) {
				FileHelper.validateFileExtension(FileField.USER_AVATAR, file, callback);
			},
			limits: filesConfig[FileField.USER_AVATAR],
			storage: diskStorage({
				destination: 'public',
				filename(
					req: AuthTypes.TAuthorizedRequest,
					file: Express.Multer.File,
					callback: (error: Error | null, filename: string) => void,
				) {
					FileHelper.rename(req.user, file, callback);
				},
			}),
		}),
	)
	@Post(Route.USER_AVATAR)
	public async uploadAvatar(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
		@UploadedFile() file?: Express.Multer.File,
	): Promise<UploadAvatarResponseDto> {
		if (!file) {
			throw new BadRequestException(`File extension unacceptable|${FileField.USER_AVATAR}`);
		}

		await this._usersService.updateUserAvatarUrl(appUserPayload.id, file.filename);

		return { avatarUrl: file.filename };
	}

	@Delete(Route.USER_AVATAR)
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deleteAvatar(@AppUserPayload() appUserPayload: JwtPayloadDto): Promise<void> {
		await this._appUserService.deleteUserAvatar(appUserPayload.id);
	}
}
