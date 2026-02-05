import * as crypto from 'node:crypto';

import { DateHelper } from '@helpers';

import { PasswordResetTokenDto } from '@dtos/passwordResetToken';

/**
 * Class with static helper method fow action related to password reset token
 */
export class PasswordResetTokensHelper {
	/**
	 * Generate random UUID string for password reset token
	 * @returns string - randomly generated UUID string
	 */
	public static generateToken(): string {
		return crypto.randomUUID();
	}

	/**
	 * Validate if password reset token already expired or not
	 * @param passwordResetToken - DTO object with password reset token
	 * @returns boolean - boolean value representing if token expired or not
	 */
	public static isExpired(passwordResetToken: PasswordResetTokenDto): boolean {
		if (!passwordResetToken.expiresAt) {
			return true;
		}

		return DateHelper.isDateLessThanCurrent(passwordResetToken.expiresAt);
	}
}
