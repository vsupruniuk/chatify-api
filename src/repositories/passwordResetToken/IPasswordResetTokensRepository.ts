import { PasswordResetToken } from '@entities/PasswordResetToken.entity';

export interface IPasswordResetTokensRepository {
	/**
	 * Method for updating user password reset token
	 * @param id - token id for updating
	 * @param token - new token value
	 * @param expiresAt - new token expiration date
	 * @returns PasswordResetToken - updated token record
	 */
	updateToken(id: string, token: string, expiresAt: string): Promise<PasswordResetToken>;
}
