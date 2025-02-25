import { JWTToken } from '@entities/JWTToken.entity';

export interface IJWTTokensRepository {
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

	// /**
	//  * Method for searching JWT token by id
	//  * @param id - token id
	//  * @returns JWTToken - if token was found
	//  * @returns null - if token wasn't found
	//  */
	// getById(id: string): Promise<JWTToken | null>;
	//
	// /**
	//  * Method for updating user JWT token
	//  * @param id - token id to update
	//  * @param token - new token value
	//  * @returns true - if token was updated
	//  * @returns false - if token wasn't updated
	//  */
	// updateToken(id: string, token: string): Promise<boolean>;
	//
	// /**
	//  * Method for deleting token
	//  * @param id - token id to delete
	//  * @returns true - if token was deleted
	//  * @returns false - if token wasn't deleted
	//  */
	// deleteToken(id: string): Promise<boolean>;
}
