import { OTPCode } from '@entities/OTPCode.entity';

/**
 * Interface representing public methods of OTP codes repository
 */
export interface IOTPCodesRepository {
	/**
	 * Method for updating existing OTP code
	 * @param id - code id to update
	 * @param code - new code value
	 * @param expiresAt - new code expiration date
	 */
	update(id: string, code: number, expiresAt: string): Promise<OTPCode>;
}
