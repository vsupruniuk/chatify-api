import { AppUserDto } from '@DTO/appUser/appUser.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';

/**
 * Interface representing public methods of users service
 */
export interface IUsersService {
	/**
	 * Method for searching users by their nicknames
	 * @param userNickname - logged-in user nickname
	 * @param nickname - user nickname for search
	 * @param page - number of skipped record sets. Default: 1
	 * @param take - number of records to take. Default: 10
	 * @returns UserPublicDto[] - array of founded users
	 * @returns [] - empty array if no users found
	 */
	getPublicUsers(
		userNickname: string,
		nickname: string,
		page?: number,
		take?: number,
	): Promise<UserPublicDto[]>;

	/**
	 * Method for searching user by id. Return all user information (except service information of the DB)
	 * @param email - user id for searching
	 * @returns UserFullDto - if user was found. Not used as API public response
	 * @returns null - if user wasn't found
	 */
	getFullUserByEmail(email: string): Promise<UserFullDto | null>;

	/**
	 * Method for searching user by id. Return all user information (except service information of the DB)
	 * @param id - user id for searching
	 * @returns UserFullDto - if user was found. Not used as API public response
	 * @returns null - if user wasn't found
	 */
	getFullUserById(id: string): Promise<UserFullDto | null>;

	/**
	 * Method for searching one specific user by email
	 * @param email - user email for searching
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByEmail(email: string): Promise<UserShortDto | null>;

	/**
	 * Method for searching one specific user by nickname
	 * @param nickname - user nickname for searching
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByNickname(nickname: string): Promise<UserShortDto | null>;

	/**
	 * Method for searching user by its password reset token
	 * @param token - user reset token
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByResetPasswordToken(token: string): Promise<UserFullDto | null>;

	/**
	 * Method for searching current authorized user
	 * @param id - user id from access token
	 * @returns AppUserDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getAppUser(id: string): Promise<AppUserDto | null>;

	/**
	 * Method for creating user from signup data with some default settings
	 * @param signupUserDto - signup data taken from user
	 * @returns UserShortDto - created user
	 * @returns null - if user wasn't created
	 */
	createUser(signupUserDto: SignupUserDto): Promise<UserShortDto | null>;

	/**
	 * Method for updating user password
	 * @param userId - id of user which will be updated
	 * @param updateUserDto - dto with a new user data
	 * @returns true - if user was updated
	 * @returns false - if user wasn't updated
	 */
	updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean>;
}
