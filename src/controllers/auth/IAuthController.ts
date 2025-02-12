import { SignupRequestDto } from '@dtos/auth/SignupRequest.dto';

/**
 * Interface representing public methods of auth controller
 */
export interface IAuthController {
	/**
	 * Method for handling signup request from user.
	 * @param signupRequestDto - data for creating user
	 */
	signup(signupRequestDto: SignupRequestDto): Promise<void>;

	// /**
	//  * Method for activating user account via OTP code
	//  * @param response - client response object
	//  * @param accountActivationDto - code and codeId for activation
	//  * @returns LoginResponseDto - access token for login
	//  */
	// activateAccount(
	// 	response: Response,
	// 	accountActivationDto: AccountActivationDto,
	// ): Promise<LoginResponseDto>;
	//
	// /**
	//  * Method for handling request to send activation code one more time for activation account
	//  * @param resendActivationCodeDto - email of not activated account
	//  */
	// resendActivationCode(resendActivationCodeDto: ResendActivationCodeDto): Promise<void>;
	//
	// /**
	//  * Method for generating reset password token and sending via email
	//  * @param resetPasswordDto - user email for generating token
	//  */
	// resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void>;
	//
	// /**
	//  * Method for resetting user password
	//  * @param resetPasswordConfirmationDto - new user password with confirmation password
	//  * @param resetToken - uuid token which user get via email
	//  */
	// resetPasswordConfirmation(
	// 	resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
	// 	resetToken: string,
	// ): Promise<void>;
	//
	// /**
	//  * Method for handling user login
	//  * @param response - client response object
	//  * @param loginDto - user email end password
	//  * @returns LoginResponseDto - access token for login
	//  */
	// login(response: Response, loginDto: LoginDto): Promise<LoginResponseDto[]>;
	//
	// /**
	//  * Method for handling log out
	//  * @param response - client response object
	//  * @param refreshToken - user refresh token from cookie
	//  */
	// logout(response: Response, refreshToken: string): Promise<void>;
	//
	// /**
	//  * Method for refreshing access and refresh tokens of authorized user
	//  * @param response - client response object
	//  * @param refreshToken - user refresh token from cookie
	//  * @returns LoginResponseDto - access token for login
	//  */
	// refresh(response: Response, refreshToken: string): Promise<LoginResponseDto[]>;
}
