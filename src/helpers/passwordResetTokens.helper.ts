import * as crypto from 'node:crypto';
import { PasswordResetTokenInfoDto } from '../types/dto/passwordResetTokens/passwordResetTokenInfo.dto';
import { DateHelper } from '@helpers/date.helper';
import { PasswordResetTokenDto } from '../types/dto/passwordResetTokens/passwordResetToken.dto';

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
