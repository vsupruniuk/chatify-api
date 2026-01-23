import { JwtPayloadDto } from '@dtos/jwt';
import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { UploadAvatarResponseDto } from '@dtos/accountSettings/userAvatar';
import {
	UpdateAccountSettingsRequestDto,
	AccountSettingsDto,
} from '@dtos/accountSettings/accountSettings';
import { UserWithAccountSettingsDto } from '@dtos/users';

/**
 * Controller interface for app user operations, like retrieving information,
 * updating settings and changing user avatar
 */
export interface IAppUserController {
	/**
	 * Get authenticated user information together with account settings
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @returns Promise<UserWithAccountSettingsDto> - user information with account settings
	 */
	getAppUser(appUserPayload: JwtPayloadDto): Promise<UserWithAccountSettingsDto>;

	/**
	 * Update user public information like nickname or first name
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param updateAppUserDto - DTO object with new values for user public information
	 * @returns Promise<UserWithAccountSettingsDto> - user information with account settings
	 */
	updateUser(
		appUserPayload: JwtPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<UserWithAccountSettingsDto>;

	/**
	 * Update user account settings
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param updateAccountSettingsRequestDto - DTO object with new values for user account settings
	 * @returns Promise<AccountSettingsDto> - updated user account settings
	 */
	updateAccountSettings(
		appUserPayload: JwtPayloadDto,
		updateAccountSettingsRequestDto: UpdateAccountSettingsRequestDto,
	): Promise<AccountSettingsDto>;

	/**
	 * Upload new file for user avatar
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param file - image file parsed by Multer
	 * @throws BadRequestException - if file extension is not an acceptable image
	 * @returns Promise<UploadAvatarResponseDto> - new url to user avatar
	 */
	uploadAvatar(
		appUserPayload: JwtPayloadDto,
		file: Express.Multer.File,
	): Promise<UploadAvatarResponseDto>;

	/**
	 * Delete user avatar file and relative database record
	 * @param appUserPayload - payload retrieved from JWT access token
	 */
	deleteAvatar(appUserPayload: JwtPayloadDto): Promise<void>;
}
