import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { DateHelper } from '@Helpers/date.helper';

/**
 * Helper clas for OTP codes
 */
export class OTPCodesHelper {
	/**
	 * Generate random OTP code between 100 000 and 999 999
	 * @return otpCode - generated OTP code
	 */
	public static generateOTPCode(): number {
		const minValue: number = 100000;
		const maxValue: number = 999999;

		return Math.floor(Math.random() * (maxValue - minValue) + minValue);
	}

	/**
	 * Check if OTP code is expired
	 * @param otpCode - code to check for expiration
	 * @returns true - if code is expired
	 * @returns false - if code is not expired
	 */
	public static isExpired(otpCode: OTPCodeResponseDto): boolean {
		if (otpCode.expiresAt === null) {
			return true;
		}

		return DateHelper.isDateLessThenCurrent(otpCode.expiresAt);
	}
}
