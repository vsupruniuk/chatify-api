import { Response } from 'express';

import { SignupRequestDto } from '@dtos/auth/signup';
import {
	ActivateAccountRequestDto,
	ActivateAccountResponseDto,
} from '@dtos/auth/accountActivation';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword';
import { ResetPasswordConfirmationRequestDto } from '@dtos/auth/resetPasswordConfirmation';
import { LoginRequestDto, LoginResponseDto } from '@dtos/auth/login';

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

	/**
	 * Method for generating reset password token and sending via email
	 * @param resetPasswordRequestDto - user email for generating token
	 */
	resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<void>;

	/**
	 * Method for resetting user password
	 * @param resetPasswordConfirmationRequestDto - new user password with confirmation password
	 * @param passwordResetToken - uuid token which user get via email
	 */
	resetPasswordConfirmation(
		resetPasswordConfirmationRequestDto: ResetPasswordConfirmationRequestDto,
		passwordResetToken: string,
	): Promise<void>;

	/**
	 * Method for handling user login
	 * @param response - client response object
	 * @param loginRequestDto - user email end password
	 * @returns LoginResponseDto - access token for login
	 */
	login(response: Response, loginRequestDto: LoginRequestDto): Promise<LoginResponseDto>;

	/**
	 * Method for handling log out
	 * @param response - client response object
	 * @param refreshToken - user refresh token from cookie
	 */
	logout(response: Response, refreshToken: string): Promise<void>;

	/**
	 * Method for handling access token refreshing
	 * @param response - user response object
	 * @param refreshToken - user refresh token from cookies
	 * @returns LoginResponseDto - access token from login
	 */
	refresh(response: Response, refreshToken?: string): Promise<LoginResponseDto>;
}
