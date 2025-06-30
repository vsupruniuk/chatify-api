import { AppUserDto } from '@dtos/appUser/AppUser.dto';
import { UpdateAppUserRequestDto } from '@dtos/appUser/UpdateAppUserRequest.dto';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

export interface IAppUserService {
	/**
	 * Retrieving current logged-in user
	 * @param id - user id from access token
	 * @returns AppUserDto - current logged-in user information
	 * @throws NotFoundException - if user not found
	 */
	getAppUser(id: string): Promise<AppUserDto>;

	/**
	 * Method for updating app user public information
	 * @param appUserPayload - logged-in user information
	 * @param updateAppUserDto - updated user information
	 * @returns AppUserDto - updated user
	 */
	updateAppUser(
		appUserPayload: JWTPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<AppUserDto>;

	/**
	 * Method for deleting user avatar
	 * @param userId - user id
	 * @throws UnauthorizedException - if failed to find user by id
	 * @throws BadRequestException - if user does not have an avatar
	 */
	deleteUserAvatar(userId: string): Promise<void>;
}
