import { SignupRequestDto } from '@dtos/auth/signup';
import { ActivateAccountRequestDto, ActivateAccountDto } from '@dtos/auth/accountActivation';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword';
import { LoginRequestDto, LoginDto } from '@dtos/auth/login';

/**
 * Service method for authorization actions
 */
export interface IAuthService {
	/**
	 * Creates user with basic configuration and sends account activation email
	 * @param signupRequestDto - DTO object with user registration data
	 * @throws ConflictException - if email or nickname already taken
	 */
	registerUser(signupRequestDto: SignupRequestDto): Promise<void>;

	/**
	 * Activates user account, creates and returns access and refresh tokens
	 * @param activateAccountRequestDto - DTO object with information for account activation
	 * @returns Promise<ActivateAccountDto> - generated access and refresh tokens
	 * @throws NotFoundException - if user with provided email and active OTP code not found
	 * @throws BadRequestException - if OTP code expired or not valid
	 * @throws UnprocessableEntityException - if failed to activate user account
	 */
	activateAccount(
		activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountDto>;

	/**
	 * Generates new activation code and sends it to the user
	 * @param resendActivationCodeRequestDto - DTO object with information for generating and sending new code
	 * @throws NotFoundException - if user with provided email does not exist
	 * @throws UnprocessableEntityException - if failed to regenerate activation code
	 */
	resendActivationCode(
		resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void>;

	/**
	 * Creates new password reset token and sends email to the user
	 * @param resetPasswordRequestDto - DTO object with information for generation and sending token
	 * @throws NotFoundException - if user with provided email not found
	 * @throws UnprocessableEntityException - if failed to generate new token
	 */
	resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<void>;

	/**
	 * Save new password for the user
	 * @param password - new user password
	 * @param token - password reset token from the email
	 * @throws NotFoundException - if user with provided and active token and email not found
	 * @throws UnprocessableEntityException - if failed to update password
	 */
	confirmResetPassword(password: string, token: string): Promise<void>;

	/**
	 * Validate user login credentials and generate access and refresh tokens
	 * @param loginRequestDto - DTO object with login credentials
	 * @returns Promise<LoginDto> - generated access and refresh tokens
	 * @throws NotFoundException - if user with provided email not exist
	 * @throws BadRequestException - if user password is not valid
	 */
	login(loginRequestDto: LoginRequestDto): Promise<LoginDto>;

	/**
	 * Reset user JWT token to null
	 * @param refreshToken - user refresh token
	 * @throws UnprocessableEntityException - if failed to reset token
	 */
	logout(refreshToken: string): Promise<void>;

	/**
	 * Generate new access and refresh tokens for logged-in user
	 * @param userRefreshToken - user refresh token
	 * @returns Promise<LoginDto> - generated access and refresh tokens
	 * @throws UnauthorizedException - if refresh token is not valid or failed to get the user from database
	 */
	refresh(userRefreshToken: string): Promise<LoginDto>;
}
