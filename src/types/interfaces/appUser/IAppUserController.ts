import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { AppUserDto } from '@DTO/appUser/appUser.dto';

export interface IAppUserController {
	/**
	 * Returns information about current logged-in user
	 * @param appUserPayload - user data from access token
	 * @returns AppUserDto - current user information
	 */
	getUser(appUserPayload: JWTPayloadDto): Promise<AppUserDto>;

	/**
	 * Update user public information
	 * @param appUserPayload - user data from access token
	 * @param updateAppUserDto - new information about user
	 */
	updateUser(appUserPayload: JWTPayloadDto, updateAppUserDto: UpdateAppUserDto): Promise<void>;

	/**
	 * Update user account settings
	 * @param appUserPayload - user data from access token
	 * @param newSettings - new account settings
	 */
	updateAccountSettings(
		appUserPayload: JWTPayloadDto,
		newSettings: UpdateAccountSettingsDto,
	): Promise<void>;

	/**
	 * Upload and save user avatar
	 * @param appUserPayload - user data from access token
	 * @param file - avatar uploaded by user
	 */
	uploadAvatar(appUserPayload: JWTPayloadDto, file: Express.Multer.File): Promise<void>;

	/**
	 * Delete user avatar
	 * @param appUserPayload - user data from access token
	 */
	deleteAvatar(appUserPayload: JWTPayloadDto): Promise<void>;
}
