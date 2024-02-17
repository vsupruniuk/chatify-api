import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { DateHelper } from '@Helpers/date.helper';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper class for password reset tokens
 */
export class PasswordResetTokensHelper {
	/**
	 * Generate new password reset token
	 * @returns PasswordResetTokenDto - token value and expiration date
	 */
	public static generateToken(): Omit<PasswordResetTokenDto, 'id'> {
		return {
			token: uuidv4(),
			expiresAt: DateHelper.dateTimeFuture(1000 * 60 * 60 * 24),
		};
	}

	public static isExpired(passwordResetToken: PasswordResetTokenDto): boolean {
		return DateHelper.isDateLessThenCurrent(passwordResetToken.expiresAt);
	}
}
