import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';

export interface IJWTTokensRepository {
	/**
	 * Method for searching jwt token by id
	 * @param id - token id
	 * @returns JWTTokenFullDto - if token was found
	 * @returns null - if token wasn't found
	 */
	getById(id: string): Promise<JWTTokenFullDto | null>;
}
