import { PasswordResetToken } from '@entities';

/**
 * Repository interface for database actions with password reset tokens
 */
export interface IPasswordResetTokensRepository {
	/**
	 * Update password reset token by its id with new value and expiration date
	 * @param id - token id than must be updated
	 * @param token - new token value
	 * @param expiresAt - new token expiration date
	 * @returns Promise<OTPCode> - updated password reset token record
	 */
	updateToken(id: string, token: string, expiresAt: string): Promise<PasswordResetToken>;
}
