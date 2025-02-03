import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetTokenInfoDto } from '@DTO/passwordResetTokens/passwordResetTokenInfo.dto';
import { DateHelper } from '@Helpers/date.helper';
import * as crypto from 'node:crypto';

/**
 * Helper class for password reset tokens
 */
export class PasswordResetTokensHelper {
	/**
	 * Generate new password reset token
	 * @returns PasswordResetTokenDto - token value and expiration date
	 */
	public static generateToken(): PasswordResetTokenInfoDto {
		return {
			token: crypto.randomUUID(),
			expiresAt: DateHelper.dateTimeFuture(1000 * 60 * 60 * 24),
		};
	}

	public static isExpired(passwordResetToken: PasswordResetTokenDto): boolean {
		return DateHelper.isDateLessThanCurrent(passwordResetToken.expiresAt);
	}
}
