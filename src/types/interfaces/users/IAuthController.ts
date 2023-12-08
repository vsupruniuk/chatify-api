import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { ResponseResult } from '@Responses/ResponseResult';

/**
 * Interface representing public methods of auth controller
 */
export interface IAuthController {
	/**
	 * Method for handling signup request from user.
	 * @param signupUserDTO - data for creating user
	 * @returns userShortDto - created user
	 */
	signup(signupUserDTO: SignupUserDto): Promise<ResponseResult>;
}
