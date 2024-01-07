import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { ResendActivationCodeDto } from '@DTO/auth/ResendActivationCode.dto';
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
	 * @returns responseResult - successful result if user was activated
	 */
	activateAccount(accountActivationDto: AccountActivationDto): Promise<ResponseResult>;

	/**
	 * Method for handling request to send activation code one more time for activation account
	 * @param resendActivationCodeDto - email of not activated account
	 * @returns responseResult - successful result if code was resend to user email
	 */
	resendActivationCode(resendActivationCodeDto: ResendActivationCodeDto): Promise<ResponseResult>;
}
