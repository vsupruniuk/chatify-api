import * as crypto from 'crypto';
import { DateHelper } from '@helpers/date.helper';
import { PasswordResetTokenDto } from '@dtos/passwordResetToken/PasswordResetToken.dto';

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
