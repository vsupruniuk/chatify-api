/**
 * Service interface for actions with password reset token
 */
export interface IPasswordResetTokensService {
	/**
	 * Generate new password reset token and save to the database
	 * @param id - id of password reset token record
	 * @returns Promise<string | null> - generated token value or null if failed to generate new token
	 */
	regenerateToken(id: string): Promise<string | null>;
}
