import * as crypto from 'node:crypto';

import { DateHelper } from '@helpers';

import { OtpCodeDto } from '@dtos/otpCode';

import { otpCodeConfig } from '@configs';

/**
 * Class with static helper methods for actions with OTP codes
 */
export class OtpCodesHelper {
	/**
	 * Generates random 6-digit number for OTP code
	 * @returns number - randomly generated code
	 */
	public static generateOtpCode(): number {
		return crypto.randomInt(otpCodeConfig.minValue, otpCodeConfig.maxValue);
	}

	/**
	 * Validate if provided expired or not
	 * @param otpCode - DTO object with OTP code
	 * @returns boolean - value represents if code expired or not
	 */
	public static isExpired(otpCode: OtpCodeDto): boolean {
		if (!otpCode.expiresAt) {
			return true;
		}

		return DateHelper.isDateLessThanCurrent(otpCode.expiresAt);
	}
}
