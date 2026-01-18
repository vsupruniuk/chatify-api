import * as crypto from 'node:crypto';

import { DateHelper } from '@helpers';

import { PasswordResetTokenDto } from '@dtos/passwordResetToken';

/**
 * Helper class for password reset tokens
 */
export class PasswordResetTokensHelper {
	/**
	 * Generate new password reset token
	 * @returns PasswordResetTokenDto - token value and expiration date
	 */
	public static generateToken(): string {
		return crypto.randomUUID();
	}

	public static isExpired(passwordResetToken: PasswordResetTokenDto): boolean {
		if (!passwordResetToken.expiresAt) {
			return true;
		}

		return DateHelper.isDateLessThanCurrent(passwordResetToken.expiresAt);
	}
}
