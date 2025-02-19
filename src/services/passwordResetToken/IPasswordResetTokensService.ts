export interface IPasswordResetTokensService {
	/**
	 * Method for regenerating user password reset token
	 * @param id - password reset token id
	 * @returns generated token
	 */
	regenerateToken(id: string): Promise<string | null>;
	// /**
	//  * Method for creating new reset token id or updating if token with this id already exist
	//  * @param userId - user id to update with new token info
	//  * @param userResetPasswordTokenId - token id
	//  * @returns token - token value if token was created or updated
	//  * @returns null - if token wasn't created or updated
	//  */
	// saveToken(userId: string, userResetPasswordTokenId: string | null): Promise<string | null>;
	//
	// /**
	//  * Method for deleting password reset token by its id
	//  * @param tokenId - token id to delete
	//  * @returns true - if token was deleted
	//  * @returns false - if token wasn't deleted
	//  */
	// deleteToken(tokenId: string): Promise<boolean>;
}
