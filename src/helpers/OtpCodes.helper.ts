import * as crypto from 'node:crypto';

import { DateHelper } from '@helpers';

import { OtpCodeDto } from '@dtos/otpCode';
import { otpCodeConfig } from '@configs';

/**
 * Helper clas for OTP codes
 */
export class OtpCodesHelper {
	/**
	 * Generate random 6 digit OTP code
	 * @return otpCode - generated OTP code
	 */
	public static generateOTPCode(): number {
		return crypto.randomInt(otpCodeConfig.minValue, otpCodeConfig.maxValue);
	}

	/**
	 * Check if OTP code is expired
	 * @param otpCode - code for expiration checking
	 * @returns true - if code is expired
	 * @returns false - if code is not expired
	 */
	public static isExpired(otpCode: OtpCodeDto): boolean {
		if (!otpCode.expiresAt) {
			return true;
		}

		return DateHelper.isDateLessThanCurrent(otpCode.expiresAt);
	}
}
