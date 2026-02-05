import { OTPCode } from '@entities';

/**
 * Repository interface for database actions with OTP codes
 */
export interface IOtpCodesRepository {
	/**
	 * Update OTP code by its id with new value and expiration date
	 * @param id - code id that must be updated
	 * @param code - new code value
	 * @param expiresAt - new code expiration date
	 * @returns Promise<OTPCode> - updated OTP code record
	 */
	updateOtpCode(id: string, code: number, expiresAt: string): Promise<OTPCode>;
}
