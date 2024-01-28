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
}
