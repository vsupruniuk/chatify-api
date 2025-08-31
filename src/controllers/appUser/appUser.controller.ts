import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Inject,
	Patch,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
import { IAppUserController } from '@controllers/appUser/IAppUserController';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { AppUserPayload } from '@decorators/data/AppUserPayload.decorator';
import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { UpdateAppUserRequestDto } from '@dtos/appUser/UpdateAppUserRequest.dto';
import { DtoNotEmptyPipe } from '@pipes/dtoNotEmpty.pipe';
import { IAppUserService } from '@services/appUser/IAppUserService';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings/UpdateAccountSettingsRequest.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';
import { IAccountSettingsService } from '@services/accountSettings/IAccountSettingsService';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileFields } from '@enums/FileFields.enum';
import { GlobalTypes } from '../../types/global';
import { diskStorage } from 'multer';
import { FileHelper } from '@helpers/file.helper';
import { IUsersService } from '@services/users/IUsersService';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar/UploadAvatarResponse.dto';

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
	public async deleteAvatar(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<void> {
		await this._appUserService.deleteUserAvatar(appUserPayload.id);
	}
}
