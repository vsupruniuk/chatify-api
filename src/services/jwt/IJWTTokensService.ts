import { JWTPayloadDto } from '@dtos/jwt';

export interface IJWTTokensService {
	/**
	 * Generate JWT access token with user data
	 * @param payload - user data for generation token
	 * @returns JWTPayloadDto - JWT token
	 */
	generateAccessToken(payload: JWTPayloadDto): Promise<string>;

	/**
	 * Generate JWT refresh token with user data
	 * @param payload - user data for generation token
	 * @returns JWTPayloadDto - JWT token
	 */
	generateRefreshToken(payload: JWTPayloadDto): Promise<string>;

	/**
	 * Save new user refresh token to DB or update existing one
	 * @param id - token id for updating
	 * @param token - JWT refresh token
	 */
	saveRefreshToken(id: string, token: string): Promise<void>;

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
	 * Method for resetting user JWT token
	 * @param userId - user id
	 * @returns true - if token was set to null
	 * @returns false if token wasn't set to null
	 */
	resetUserToken(userId: string): Promise<boolean>;
}
