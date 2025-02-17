import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { ActivateAccountRequestDto } from '@dtos/auth/accountActivation/ActivateAccountRequest.dto';
import { Response } from 'express';
import { ActivateAccountResponseDto } from '@dtos/auth/accountActivation/ActivateAccountResponse.dto';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode/ResendActivationCodeRequest.dto';

/**
 * Interface representing public methods of auth controller
 */
export interface IAuthController {
	/**
	 * Method for handling signup request from user.
	 * @param signupRequestDto - data for creating user
	 */
	signup(signupRequestDto: SignupRequestDto): Promise<void>;

	/**
	 * Method for activating user account via OTP code
	 * @param response - user response object
	 * @param activateAccountRequestDto - generated access token
	 */
	activateAccount(
		response: Response,
		activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountResponseDto>;

	/**
	 * Method for handling request to send activation code one more time for activation account
	 * @param resendActivationCodeRequestDto - email of not activated account
	 */
	resendActivationCode(
		resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void>;

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
