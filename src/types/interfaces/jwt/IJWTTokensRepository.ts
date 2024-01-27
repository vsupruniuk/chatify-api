import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';

export interface IJWTTokensRepository {
	/**
	 * Method for searching JWT token by id
	 * @param id - token id
	 * @returns JWTTokenFullDto - if token was found
	 * @returns null - if token wasn't found
	 */
	getById(id: string): Promise<JWTTokenFullDto | null>;

	/**
	 * Method for creating JWT token
	 * @param token - token value
	 * @returns id - id of created token
	 */
	createToken(token: string): Promise<string>;
}
