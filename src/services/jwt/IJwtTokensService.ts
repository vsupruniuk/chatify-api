import { JwtPayloadDto } from '@dtos/jwt';

/**
 * Service interface for actions with jwt tokens
 */
export interface IJwtTokensService {
	/**
	 * Creates access token with provided data
	 * @param payload - payload data for access token
	 * @returns string - generates access token
	 */
	generateAccessToken(payload: JwtPayloadDto): Promise<string>;

	/**
	 * Creates refresh token with provided data
	 * @param payload - payload data for refresh token
	 * @returns string - generates refresh token
	 */
	generateRefreshToken(payload: JwtPayloadDto): Promise<string>;

	/**
	 * Verify if access token valid and returns payload data
	 * @param token - JWT token for validation
	 * @returns Promise<JwtPayloadDto | null> - payload data or null of token is not valid
	 */
	verifyAccessToken(token: string): Promise<JwtPayloadDto | null>;

	/**
	 * Verify if refresh token valid and returns payload data
	 * @param token - JWT token for validation
	 * @returns Promise<JwtPayloadDto | null> - payload data or null of token is not valid
	 */
	verifyRefreshToken(token: string): Promise<JwtPayloadDto | null>;

	/**
	 * Saves user refresh token to the database
	 * @param id - id of user JWT token record
	 * @param token - refresh token value
	 */
	saveRefreshToken(id: string, token: string): Promise<void>;

	/**
	 * Reset user refresh token to null
	 * @param userId - id of user to reset token
	 * @returns Promise<boolean> - boolean value represents if token was reset or not
	 */
	resetUserToken(userId: string): Promise<boolean>;
}
