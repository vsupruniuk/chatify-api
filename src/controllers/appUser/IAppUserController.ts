import { JwtPayloadDto } from '@dtos/jwt';
import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar';
import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';
import { UserWithAccountSettingsDto } from '@dtos/users';

export interface IAppUserController {
	/**
	 * Returns information about current logged-in user
	 * @param appUserPayload - user payload from JWT token
	 * @returns UserWithAccountSettingsDto - information about current logged in user
	 */
	getAppUser(appUserPayload: JwtPayloadDto): Promise<UserWithAccountSettingsDto>;

	/**
	 * Update user public information
	 * @param appUserPayload - user data from access token
	 * @param updateAppUserDto - new information about user
	 * @returns UserWithAccountSettingsDto - updated app user
	 */
	updateUser(
		appUserPayload: JwtPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<UserWithAccountSettingsDto>;

	/**
	 * Update user account settings
	 * @param appUserPayload - user data from access token
	 * @param updateAccountSettingsRequestDto - new account settings
	 * @returns AccountSettingsDto - updated account settings
	 */
	updateAccountSettings(
		appUserPayload: JwtPayloadDto,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto>;

	/**
	 * Upload and save user avatar
	 * @param appUserPayload - user data from access token
	 * @param file - avatar uploaded by user
	 * @returns UploadAvatarResponseDto - updated user avatar url
	 */
	uploadAvatar(
		appUserPayload: JwtPayloadDto,
		file: Express.Multer.File,
	): Promise<UploadAvatarResponseDto>;

	/**
	 * Delete user avatar
	 * @param appUserPayload - user data from access token
	 */
	deleteAvatar(appUserPayload: JwtPayloadDto): Promise<void>;
}
