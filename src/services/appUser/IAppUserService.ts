import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { JwtPayloadDto } from '@dtos/jwt';
import { UserWithAccountSettingsDto } from '@dtos/users';

export interface IAppUserService {
	/**
	 * Retrieving current logged-in user
	 * @param id - user id from access token
	 * @returns UserWithAccountSettingsDto - current logged-in user information
	 * @throws NotFoundException - if user not found
	 */
	getAppUser(id: string): Promise<UserWithAccountSettingsDto>;

	/**
	 * Method for updating app user public information
	 * @param appUserPayload - logged-in user information
	 * @param updateAppUserDto - updated user information
	 * @returns UserWithAccountSettingsDto - updated user
	 */
	updateAppUser(
		appUserPayload: JwtPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<UserWithAccountSettingsDto>;

	/**
	 * Method for deleting user avatar
	 * @param userId - user id
	 * @throws UnauthorizedException - if failed to find user by id
	 * @throws BadRequestException - if user does not have an avatar
	 */
	deleteUserAvatar(userId: string): Promise<void>;
}
