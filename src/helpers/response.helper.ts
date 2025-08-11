import { Response } from 'express';
import { CookiesNames } from '@enums/CookiesNames.enum';
import { Environments } from '@enums/Environments.enum';

/**
 * Helper class for handling response object manipulation
 */
export class ResponseHelper {
	/**
	 * Method for saving refresh token in user cookies
	 * @param response - user response object
	 * @param refreshToken - JWT refresh token
	 */
	public static setRefreshTokenCookie(response: Response, refreshToken: string): void {
		response.cookie(CookiesNames.REFRESH_TOKEN, refreshToken, {
			maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
			secure: process.env.NODE_ENV !== Environments.TEST,
			sameSite: 'strict',
			httpOnly: true,
		});
	}
}
