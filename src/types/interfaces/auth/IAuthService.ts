import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';

export interface IAuthService {
	/**
	 * Method for activating user account via OTP code
	 * @param accountActivationDto - code and codeId for activation
	 * @returns true - if account was activated
	 * @returns false - if account wasn't activated
	 */
	activateAccount(accountActivationDto: AccountActivationDto): Promise<boolean>;
}
