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
 * Controller interface for authorization operations like account activation, login
 */
export interface IAuthController {
	/**
	 * Sign up user and create default account
	 * @param signupRequestDto - DTO object with user initial information
	 */
	signup(signupRequestDto: SignupRequestDto): Promise<void>;

	/**
	 * Accept user activation code and activate account
	 * @param response - user response object provided by Nest.js
	 * @param activateAccountRequestDto - DTO with user account activation data
	 * @returns Promise<ActivateAccountResponseDto> - JWT access token
	 */
	activateAccount(
		response: Response,
		activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountResponseDto>;

	/**
	 * Generate new account activation code and send again to the user
	 * @param resendActivationCodeRequestDto - DTO with information for generating and sending new activation code
	 */
	resendActivationCode(
		resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void>;

	/**
	 * Generate password reset token from the user and send to him via email
	 * @param resetPasswordRequestDto - DTO with the information for generating password reset token for the user
	 */
	resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<void>;

	/**
	 * Accept a new password from the user and set it as permanent
	 * @param resetPasswordConfirmationRequestDto - DTO object with new user password
	 * @param passwordResetToken - token received by the user from the email
	 */
	resetPasswordConfirmation(
		resetPasswordConfirmationRequestDto: ResetPasswordConfirmationRequestDto,
		passwordResetToken: string,
	): Promise<void>;

	/**
	 * Proceed user login, obtain access and refresh tokens
	 * @param response - user response object provided by Nest.js
	 * @param loginRequestDto - DTO object with user email and password
	 * @returns Promise<LoginResponseDto> - generated access token
	 */
	login(response: Response, loginRequestDto: LoginRequestDto): Promise<LoginResponseDto>;

	/**
	 * Handle user log out process
	 * @param response - user response object provided by Nest.js
	 * @param refreshToken - user refresh token from cookies
	 */
	logout(response: Response, refreshToken: string): Promise<void>;

	/**
	 * Generate new access and refresh tokens for the user
	 * @param response - user response object provided by Nest.js
	 * @param refreshToken - user refresh token from cookies
	 * @returns Promise<LoginResponseDto> - generated access token
	 */
	refresh(response: Response, refreshToken?: string): Promise<LoginResponseDto>;
}
