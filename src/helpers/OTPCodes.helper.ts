import * as crypto from 'crypto';
import { OTPCodeResponseDto } from '../types/dto/OTPCodes/OTPCodeResponse.dto';
import { DateHelper } from '@helpers/date.helper';

/**
 * Helper clas for OTP codes
 */
export class OTPCodesHelper {
	private static OTP_CODE_LENGTH: number = 6;
	private static MIN_CODE_DIGIT: number = 1;
	private static MAX_CODE_DIGIT: number = 10;
	/**
	 * Generate random 6 digit OTP code
	 * @return otpCode - generated OTP code
	 */
	public static generateOTPCode(): number {
		let code: string = '';

		while (code.length < this.OTP_CODE_LENGTH) {
			code += crypto.randomInt(this.MIN_CODE_DIGIT, this.MAX_CODE_DIGIT);
		}

		return Number(code);
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

		return DateHelper.isDateLessThanCurrent(otpCode.expiresAt);
	}
}
