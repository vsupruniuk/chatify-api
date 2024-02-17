export interface IPasswordResetTokensService {
	/**
	 * Method for creating new reset token id or updating if token with this id already exist
	 * @param userId - user id to update with new token info
	 * @param userResetPasswordTokenId - token id
	 * @returns token - token value if token was created or updated
	 * @returns null - if token wasn't created or updated
	 */
	saveToken(userId: string, userResetPasswordTokenId: string | null): Promise<string | null>;
}
