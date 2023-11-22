import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';

/**
 * Interface representing public methods of users service
 */
export interface IUsersService {
	/**
	 * Method for creating user from signup data with some default settings
	 * @param signupUserDto - signup data taken from user
	 * @returns UserShortDto - created user
	 */
	createUser(signupUserDto: SignupUserDto): Promise<UserShortDto>;
}
