import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { UpdateAppUserRequestDto } from '@dtos/appUser/UpdateAppUserRequest.dto';
import { UpdateAccountSettingsRequestDto } from '@dtos/accountSettings/accountSettings/UpdateAccountSettingsRequest.dto';
import { AccountSettingsDto } from '@dtos/accountSettings/accountSettings/AccountSettings.dto';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar/UploadAvatarResponse.dto';

export interface IAppUserController {
	/**
	 * Returns information about current logged-in user
	 * @param appUserPayload - user payload from JWT token
	 * @returns AppUserDto - information about current logged in user
	 */
	getAppUser(appUserPayload: JWTPayloadDto): Promise<AppUserDto>;

	/**
	 * Update user public information
	 * @param appUserPayload - user data from access token
	 * @param updateAppUserDto - new information about user
	 * @returns AppUserDto - updated app user
	 */
	updateUser(
		appUserPayload: JWTPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<AppUserDto>;

	/**
	 * Update user account settings
	 * @param appUserPayload - user data from access token
	 * @param updateAccountSettingsRequestDto - new account settings
	 * @returns AccountSettingsDto - updated account settings
	 */
	updateAccountSettings(
		appUserPayload: JWTPayloadDto,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto>;

	/**
	 * Upload and save user avatar
	 * @param appUserPayload - user data from access token
	 * @param file - avatar uploaded by user
	 * @returns UploadAvatarResponseDto - updated user avatar url
	 */
	uploadAvatar(
		appUserPayload: JWTPayloadDto,
		file: Express.Multer.File,
	): Promise<UploadAvatarResponseDto>;

	/**
	 * Delete user avatar
	 * @param appUserPayload - user data from access token
	 */
	deleteAvatar(appUserPayload: JWTPayloadDto): Promise<void>;
}
