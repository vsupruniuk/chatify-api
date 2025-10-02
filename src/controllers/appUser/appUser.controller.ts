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

import { ResponseTransformInterceptor, AuthInterceptor } from '@interceptors';

import { IAppUserController } from '@controllers';

import { JWTPayloadDto } from '@dtos/jwt';
import { AppUserDto, UpdateAppUserRequestDto } from '@dtos/appUser';
import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar';

import { AppUserPayload } from '@decorators/data';

import { CustomProviders, FileFields } from '@enums';

import { DtoNotEmptyPipe } from '@pipes';

import { IAppUserService, IAccountSettingsService, IUsersService } from '@services';

import { GlobalTypes } from '@customTypes';

import { FileHelper } from '@helpers';

@Controller('app-user')
@UseInterceptors(AuthInterceptor)
@UseInterceptors(ResponseTransformInterceptor)
export class AppUserController implements IAppUserController {
	constructor(
		@Inject(CustomProviders.CTF_APP_USER_SERVICE)
		private readonly _appUserService: IAppUserService,

		@Inject(CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE)
		private readonly _accountSettingsService: IAccountSettingsService,

		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get()
	public async getAppUser(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<AppUserDto> {
		return await this._appUserService.getAppUser(appUserPayload.id);
	}

	@Patch()
	public async updateUser(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@Body(DtoNotEmptyPipe) updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<AppUserDto> {
		return this._appUserService.updateAppUser(appUserPayload, updateAppUserDto);
	}

	@Patch('account-settings')
	public async updateAccountSettings(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@Body(DtoNotEmptyPipe) updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto> {
		return this._accountSettingsService.updateAccountSettings(
			appUserPayload.id,
			updateAccountSettingsRequestDto,
		);
	}

	@UseInterceptors(
		FileInterceptor(FileFields.USER_AVATAR, {
			fileFilter(
				req: GlobalTypes.TAuthorizedRequest,
				file: Express.Multer.File,
				callback: (error: Error | null, acceptFile: boolean) => void,
			) {
				FileHelper.validateFileExtension(file, callback);
			},
			limits: { fileSize: 10_485_760, files: 1 },
			storage: diskStorage({
				destination: 'public',
				filename(
					req: GlobalTypes.TAuthorizedRequest,
					file: Express.Multer.File,
					callback: (error: Error | null, filename: string) => void,
				) {
					FileHelper.renameAndSave(req.user, file, callback);
				},
			}),
		}),
	)
	@Post('user-avatar')
	public async uploadAvatar(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@UploadedFile() file?: Express.Multer.File,
	): Promise<UploadAvatarResponseDto> {
		if (!file) {
			throw new BadRequestException('File extension unacceptable|user-avatar');
		}

		await this._usersService.updateUserAvatarUrl(appUserPayload.id, file.filename);

		return { avatarUrl: file.filename };
	}

	@Delete('user-avatar')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async deleteAvatar(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<void> {
		await this._appUserService.deleteUserAvatar(appUserPayload.id);
	}
}
