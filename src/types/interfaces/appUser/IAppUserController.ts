import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { UpdateAppUserDto } from '@DTO/appUser/UpdateAppUser.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { ResponseResult } from '@Responses/ResponseResult';

export interface IAppUserController {
	/**
	 * Returns information about current logged-in user
	 * @param appUserPayload - user data from access token
	 * @returns ResponseResult - current user information
	 */
	getUser(appUserPayload: JWTPayloadDto): Promise<ResponseResult>;

	/**
	 * Update user public information
	 * @param appUserPayload - user data from access token
	 * @param updateAppUserDto - new information about user
	 * @returns ResponseResult - successful response result
	 */
	updateUser(
		appUserPayload: JWTPayloadDto,
		updateAppUserDto: UpdateAppUserDto,
	): Promise<ResponseResult>;

	/**
	 * Update user account settings
	 * @param appUserPayload - user data from access token
	 * @param newSettings - new account settings
	 * @returns ResponseResult - successful response result
	 */
	updateAccountSettings(
		appUserPayload: JWTPayloadDto,
		newSettings: UpdateAccountSettingsDto,
	): Promise<ResponseResult>;

	/**
	 * Upload and save user avatar
	 * @param appUserPayload - user data from access token
	 * @param file - avatar uploaded by user
	 * @returns ResponseResult - successful response result
	 */
	uploadAvatar(appUserPayload: JWTPayloadDto, file: Express.Multer.File): Promise<ResponseResult>;

	/**
	 * Delete user avatar
	 * @param appUserPayload - user data from access token
	 * @returns ResponseResult - successful response result
	 */
	deleteAvatar(appUserPayload: JWTPayloadDto): Promise<ResponseResult>;
}
