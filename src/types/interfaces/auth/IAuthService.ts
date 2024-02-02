import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';

/**
 * Interface representing public methods of auth service
 */
export interface IAuthService {
	/**
	 * Method for activating user account via OTP code
	 * @param accountActivationDto - code and codeId for activation
	 * @returns true - if account was activated
	 * @returns false - if account wasn't activated
	 */
	activateAccount(accountActivationDto: AccountActivationDto): Promise<boolean>;

	/**
	 * Method to check if user password valid or not
	 * @param passwordFromDto - password received from user request
	 * @param passwordFromDb - user password received from DB
	 * @returns true - if user password valid
	 * @returns false - if user password invalid
	 */
	validatePassword(passwordFromDto: string, passwordFromDb: string): Promise<boolean>;
}
