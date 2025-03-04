import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';
import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
import { IAppUserController } from '@controllers/appUser/IAppUserController';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { AppUserPayload } from '@decorators/data/AppUser.decorator';
import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IUsersService } from '@services/users/IUsersService';

@Controller('app-user')
@UseInterceptors(AuthInterceptor)
@UseInterceptors(ResponseTransformInterceptor)
export class AppUserController implements IAppUserController {
	constructor(
		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get()
	public async getAppUser(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<AppUserDto> {
		return await this._usersService.getAppUser(appUserPayload.id);
	}

	// 	// TODO check if needed
	// 	@Patch()
	// 	@HttpCode(HttpStatus.OK)
	// 	public async updateUser(
	// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
	// 		@Body() updateAppUserDto: UpdateAppUserDto,
	// 	): Promise<void> {
	// 		if (!updateAppUserDto || !Object.keys(updateAppUserDto).length) {
	// 			throw new BadRequestException(['At least 1 field to change should be passed']);
	// 		}
	//
	// 		if (updateAppUserDto.nickname) {
	// 			const userByNickname: UserShortDto | null = await this._usersService.getByNickname(
	// 				updateAppUserDto.nickname,
	// 			);
	//
	// 			if (userByNickname) {
	// 				throw new ConflictException(['User with this nickname already exist|nickname']);
	// 			}
	// 		}
	//
	// 		const isUserUpdated: boolean = await this._usersService.updateUser(
	// 			appUserPayload.id,
	// 			updateAppUserDto,
	// 		);
	//
	// 		if (!isUserUpdated) {
	// 			throw new UnprocessableEntityException([
	// 				'Failed to update user information. Please try again',
	// 			]);
	// 		}
	// 	}
	//
	// 	// TODO check if needed
	// 	@Patch('account-settings')
	// 	@HttpCode(HttpStatus.OK)
	// 	public async updateAccountSettings(
	// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
	// 		@Body() newSettings: UpdateAccountSettingsDto,
	// 	): Promise<void> {
	// 		if (!newSettings || !Object.keys(newSettings).length) {
	// 			throw new BadRequestException(['At least 1 field to change should be passed']);
	// 		}
	//
	// 		const fullUser: UserFullDto | null = await this._usersService.getFullUserById(
	// 			appUserPayload.id,
	// 		);
	//
	// 		if (!fullUser) {
	// 			throw new UnauthorizedException(['Please, login to perform this action']);
	// 		}
	//
	// 		const isAccountSettingsUpdated = await this._accountSettingsService.updateAccountSettings(
	// 			fullUser.accountSettings.id,
	// 			newSettings,
	// 		);
	//
	// 		if (!isAccountSettingsUpdated) {
	// 			throw new UnprocessableEntityException([
	// 				'Failed to update account settings. Please, try again',
	// 			]);
	// 		}
	// 	}
	//
	// 	// TODO check if needed
	// 	@Post('user-avatar')
	// 	@HttpCode(HttpStatus.CREATED)
	// 	@UseInterceptors(
	// 		FileInterceptor(FileFields.USER_AVATAR, {
	// 			fileFilter(
	// 				req: Request & TUserPayload,
	// 				file: Express.Multer.File,
	// 				callback: (error: Error | null, acceptFile: boolean) => void,
	// 			): void {
	// 				FileHelper.validateFileExtension(file, callback);
	// 			},
	// 			limits: { fileSize: 10_485_760, files: 1 },
	// 			storage: diskStorage({
	// 				destination: 'public',
	// 				filename(
	// 					req: Request & TUserPayload,
	// 					file: Express.Multer.File,
	// 					callback: (error: Error | null, filename: string) => void,
	// 				): void {
	// 					FileHelper.renameAndSave(req.user, file, callback);
	// 				},
	// 			}),
	// 		}),
	// 	)
	// 	public async uploadAvatar(
	// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
	// 		@UploadedFile() file: Express.Multer.File,
	// 	): Promise<void> {
	// 		if (!file) {
	// 			throw new BadRequestException([
	// 				`Provide image file with size less than 10 MB to upload|${FileFields.USER_AVATAR}`,
	// 			]);
	// 		}
	//
	// 		const fullUser: UserFullDto | null = await this._usersService.getFullUserById(
	// 			appUserPayload.id,
	// 		);
	//
	// 		if (!fullUser) {
	// 			throw new UnauthorizedException(['Please, login to perform this action']);
	// 		}
	//
	// 		if (fullUser.avatarUrl) {
	// 			FileHelper.deleteFile(fullUser.avatarUrl);
	// 		}
	//
	// 		const isUserAvatarUrlUpdated: boolean = await this._usersService.updateUser(appUserPayload.id, {
	// 			avatarUrl: file.filename,
	// 		});
	//
	// 		if (!isUserAvatarUrlUpdated) {
	// 			throw new UnprocessableEntityException(['Failed to save avatar. Please, try again']);
	// 		}
	// 	}
	//
	// 	// TODO check if needed
	// 	@Delete('user-avatar')
	// 	@HttpCode(HttpStatus.NO_CONTENT)
	// 	public async deleteAvatar(@AppUserPayload() appUserPayload: JWTPayloadDto): Promise<void> {
	// 		const fullUser: UserFullDto | null = await this._usersService.getFullUserById(
	// 			appUserPayload.id,
	// 		);
	//
	// 		if (!fullUser) {
	// 			throw new UnauthorizedException(['Please, login to perform this action']);
	// 		}
	//
	// 		if (!fullUser.avatarUrl) {
	// 			throw new NotFoundException(['User does not have saved avatar|user-avatar']);
	// 		}
	//
	// 		FileHelper.deleteFile(fullUser.avatarUrl);
	//
	// 		const isUpdated: boolean = await this._usersService.updateUser(fullUser.id, {
	// 			avatarUrl: null,
	// 		});
	//
	// 		if (!isUpdated) {
	// 			throw new UnprocessableEntityException(['Failed to delete avatar, please try again']);
	// 		}
	// 	}
}
