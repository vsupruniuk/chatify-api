export interface IPasswordResetTokensService {
	/**
	 * Method for regenerating user password reset token
	 * @param id - password reset token id
	 * @returns generated token
	 */
	regenerateToken(id: string): Promise<string | null>;
}
