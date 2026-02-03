import { UpdateAppUserRequestDto } from '@dtos/appUser';
import { JwtPayloadDto } from '@dtos/jwt';
import { UserWithAccountSettingsDto } from '@dtos/users';

/**
 * Service interface for actions with app user
 */
export interface IAppUserService {
	/**
	 * Retrieves the information about current logged-in user
	 * @param id - user id for searching
	 * @returns Promise<UserWithAccountSettingsDto> - found user together with account settings
	 * @throws NotFoundException - if user was not found
	 */
	getAppUser(id: string): Promise<UserWithAccountSettingsDto>;

	/**
	 * Updates current logged-in user with new values from the user
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param updateAppUserDto - DTO object with new values for updates
	 * @returns Promise<UserWithAccountSettingsDto> - updated user data with account settings
	 * @throws ConflictException - if new nickname is provided, and it's already taken
	 * @throws UnprocessableEntityException - if failed to update app user
	 */
	updateAppUser(
		appUserPayload: JwtPayloadDto,
		updateAppUserDto: UpdateAppUserRequestDto,
	): Promise<UserWithAccountSettingsDto>;

	/**
	 * Deletes user avatar url from database, and image file
	 * @param userId - user id to delete avatar
	 * @throws UnauthorizedException - if user by id not found
	 * @throws BadRequestException - if user does not have avatar
	 */
	deleteUserAvatar(userId: string): Promise<void>;
}
