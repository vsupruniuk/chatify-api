import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';

export interface IJWTTokensService {
	/**
	 * Generate JWT access token with user data
	 * @param payload - user data for generation token
	 * @returns token - JWT token
	 */
	generateAccessToken(payload: JWTPayloadDto): Promise<string>;

	/**
	 * Generate JWT refresh token with user data
	 * @param payload - user data for generation token
	 * @returns token - JWT token
	 */
	generateRefreshToken(payload: JWTPayloadDto): Promise<string>;

	/**
	 * Verify if JWT access token valid or not
	 * @param token - JWT access token
	 * @returns JWTPayloadDto - user data if JWT access token valid
	 * @returns null - if JWT access token invalid
	 */
	verifyAccessToken(token: string): Promise<JWTPayloadDto | null>;

	/**
	 * Verify if JWT refresh token valid or not
	 * @param token - JWT refresh token
	 * @returns JWTPayloadDto - user data if JWT refresh token valid
	 * @returns null - if JWT refresh token invalid
	 */
	verifyRefreshToken(token: string): Promise<JWTPayloadDto | null>;

	/**
	 * Get user JWT refresh token by id
	 * @param id - token id
	 * @returns JWTTokenFullDto - if token was found
	 * @returns null - if token wasn't found
	 */
	getById(id: string): Promise<JWTTokenFullDto | null>;

	/**
	 * Save new user refresh token to DB or update existing one
	 * @param id - user JWT token id
	 * @param token - JWT refresh token
	 * @returns id - token id of created or updated token
	 */
	saveRefreshToken(id: string | null, token: string): Promise<string>;

	/**
	 * Delete user refresh token from DB
	 * @param id - user JWT token id
	 * @returns true - if token was deleted
	 * @returns false - if token wasn't deleted
	 */
	deleteToken(id: string): Promise<boolean>;
}
