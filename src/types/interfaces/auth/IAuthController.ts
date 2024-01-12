import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { ResendActivationCodeDto } from '@DTO/auth/ResendActivationCode.dto';
import { ResetPasswordDto } from '@DTO/auth/ResetPassword.dto';
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

	/**
	 * Method for generating reset password token and sending via email
	 * @param resetPasswordDto - user email for generating token
	 * @returns responseResult - successful result if reset token was generated and send to user
	 */
	resetPassword(resetPasswordDto: ResetPasswordDto): Promise<ResponseResult>;
}
