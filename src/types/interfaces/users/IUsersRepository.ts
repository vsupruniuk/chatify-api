import { UpdateUserDto } from '@DTO/users/UpdateUser.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';
import { User } from '@Entities/User.entity';
import { TUserGetFields } from '@Types/users/TUserGetFields';

/**
 * Interface representing public methods of users repository
 */
export interface IUsersRepository {
	/**
	 * Method for searching user by one of its fields
	 * @param fieldName - acceptable field for searching
	 * @param fieldValue - value of field for searching
	 * @returns User - if user was found
	 * @returns null - if user wasn't found
	 */
	getByField(fieldName: TUserGetFields, fieldValue: string): Promise<User | null>;

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
