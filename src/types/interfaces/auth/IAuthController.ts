import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { ResponseResult } from '@Responses/ResponseResult';

/**
 * Interface representing public methods of auth controller
 */
export interface IAuthController {
	/**
	 * Method for handling signup request from user.
	 * @param signupUserDTO - data for creating user
	 * @returns responseResult - successful result with created user
	 */
	signup(signupUserDTO: SignupUserDto): Promise<ResponseResult>;

	/**
	 * Method for activating user account via OTP code
	 * @param accountActivationDto - code and codeId for activation
	 * @returns responseResult - successful result with updated and activated user account
	 */
	activateAccount(accountActivationDto: AccountActivationDto): Promise<ResponseResult>;
}
