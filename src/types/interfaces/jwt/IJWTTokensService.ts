import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';

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
}
