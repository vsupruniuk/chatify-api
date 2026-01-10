import { JWTToken } from '@entities';

export interface IJwtTokensRepository {
	/**
	 * Method for updating JWT token
	 * @param id - token id for updating
	 * @param token - token value
	 * @returns JWTToken - created token
	 */
	updateToken(id: string, token: string): Promise<JWTToken>;

	/**
	 * Reset user JWT token by user id
	 * @param userId - user id
	 * @returns JWTToken - JWT token that was reset
	 */
	resetTokenByUserId(userId: string): Promise<JWTToken>;
}
