import { JWTToken } from '@entities';

/**
 * Repository interface for database actions with JWT tokens
 */
export interface IJwtTokensRepository {
	/**
	 * Update existing JWT token with a new value
	 * @param id - token id that need to update
	 * @param token - new token value
	 * @returns Promise<JWTToken> - updated JWT token record
	 */
	updateToken(id: string, token: string): Promise<JWTToken>;

	/**
	 * Update existing JWT token by user id with a null value
	 * @param userId - user id for which JWT token need to set to null
	 * @returns Promise<JWTToken> - updated JWT token record
	 */
	resetTokenByUserId(userId: string): Promise<JWTToken>;
}
