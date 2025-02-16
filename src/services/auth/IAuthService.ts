import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { ActivateAccountRequestDto } from '@dtos/auth/accountActivation/ActivateAccountRequest.dto';
import { ActivateAccountDto } from '@dtos/auth/accountActivation/ActivateAccount.dto';

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
	//
	// /**
	//  * Method to check if user password valid or not
	//  * @param passwordFromDto - password received from user request
	//  * @param passwordFromDb - user password received from DB
	//  * @returns true - if user password valid
	//  * @returns false - if user password invalid
	//  */
	// validatePassword(passwordFromDto: string, passwordFromDb: string): Promise<boolean>;
}
