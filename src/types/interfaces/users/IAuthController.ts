import { UserShortDto } from '@DTO/users/UserShort.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';

/**
 * Interface representing public methods of auth controller
 */
export interface IAuthController {
	/**
	 * Method for handling signup request from user.
	 * @param signupUserDTO - data for creating user
	 * @returns userShortDto - created user
	 */
	signup(signupUserDTO: SignupUserDto): Promise<UserShortDto>;
}
