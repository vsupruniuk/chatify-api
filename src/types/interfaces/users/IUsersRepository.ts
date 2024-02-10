import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';
import { TUserGetFields } from '@Types/users/TUserGetFields';

/**
 * Interface representing public methods of users repository
 */
export interface IUsersRepository {
	/**
	 * Method for searching user by one of its fields
	 * @param fieldName - acceptable field for searching
	 * @param fieldValue - value of field for searching
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByField(fieldName: TUserGetFields, fieldValue: string): Promise<UserShortDto | null>;

	/**
	 * Method for searching user by id. Return all user information (except service information of the DB)
	 * @param email - user id for searching
	 * @returns UserFullDto - if user was found. Not used as API public response
	 * @returns null - if user wasn't found
	 */
	getFullUserByEmail(email: string): Promise<UserFullDto | null>;

	/**
	 * Method for searching user by its password reset token
	 * @param token - user reset token
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByResetPasswordToken(token: string): Promise<UserFullDto | null>;

	/**
	 * Method for creating user
	 * @param user - user data for creating
	 * @returns id - of created user
	 */
	createUser(user: CreateUserDto): Promise<string>;

	/**
	 * Method for updating existing user
	 * @param userId - id of user that will be updated
	 * @param updateUserDto - new user data for updating
	 * @returns true - user was updated
	 * @returns false - user wasn't created
	 */
	updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean>;
}
