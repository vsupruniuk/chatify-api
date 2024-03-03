import { JWTToken } from '@Entities/JWTToken.entity';

export interface IJWTTokensRepository {
	/**
	 * Method for searching JWT token by id
	 * @param id - token id
	 * @returns JWTToken - if token was found
	 * @returns null - if token wasn't found
	 */
	getById(id: string): Promise<JWTToken | null>;

	/**
	 * Method for creating JWT token
	 * @param token - token value
	 * @returns id - id of created token
	 */
	createToken(token: string): Promise<string>;

	/**
	 * Method for updating user JWT token
	 * @param id - token id to update
	 * @param token - new token value
	 * @returns true - if token was updated
	 * @returns false - if token wasn't updated
	 */
	updateToken(id: string, token: string): Promise<boolean>;

	/**
	 * Method for deleting token
	 * @param id - token id to delete
	 * @returns true - if token was deleted
	 * @returns false - if token wasn't deleted
	 */
	deleteToken(id: string): Promise<boolean>;
}
