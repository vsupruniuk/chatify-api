import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { DateHelper } from '@Helpers/date.helper';
import * as crypto from 'crypto';

/**
 * Helper clas for OTP codes
 */
export class OTPCodesHelper {
	private static OTP_CODE_LENGTH = 6;
	/**
	 * Generate random 6 digit OTP code
	 * @return otpCode - generated OTP code
	 */
	public static generateOTPCode(): number {
		let code: string = '';

		while (code.length < this.OTP_CODE_LENGTH) {
			const number: number = crypto.randomInt(0, 10);

			if (!code.length && number === 0) {
				continue;
			}

			code += number;
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

		return DateHelper.isDateLessThenCurrent(otpCode.expiresAt);
	}
}
