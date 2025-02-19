import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { ActivateAccountRequestDto } from '@dtos/auth/accountActivation/ActivateAccountRequest.dto';
import { ActivateAccountDto } from '@dtos/auth/accountActivation/ActivateAccount.dto';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode/ResendActivationCodeRequest.dto';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword/ResetPasswordRequest.dto';

/**
 * Interface representing public methods of auth service
 */
export interface IAuthService {
	/**
	 * Method for registration user with all necessary default relations
	 * @param signupRequestDto - user data for registration
	 * @throws ConflictException - if user with provided email or nickname already exist
	 * @throws UnprocessableEntityException - if unexpectedly failed to create user
	 */
	registerUser(signupRequestDto: SignupRequestDto): Promise<void>;

	/**
	 * Method for activating user account via OTP code
	 * @param activateAccountRequestDto - user email and code for activation
	 * @returns ActivateAccountDto - generated access and refresh tokens
	 * @throws NotFoundException - if not found user for activation with provided email
	 * @throws BadRequestException - if OTP code invalid or expired
	 * @throws UnprocessableEntityException - if failed to activate user
	 */
	activateAccount(
		activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountDto>;

	/**
	 * Method for recreating and resending OTP code for user
	 * @param resendActivationCodeRequestDto - user email to search user
	 * @throws NotFoundException - if not found user for activation with provided email
	 * @throws UnprocessableEntityException - if failed to generate new OTP code
	 */
	resendActivationCode(
		resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void>;

	/**
	 * Method for creating password reset token and sending to user via email
	 * @param resetPasswordRequestDto - user email to search user
	 */
	resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<void>;
}
