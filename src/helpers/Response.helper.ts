import { Response } from 'express';

import { CookiesName, Environment } from '@enums';

import { jwtConfig } from '@configs';

/**
 * Class with static helper methods for actions with HTTP response object
 */
export class ResponseHelper {
	/**
	 * Save provided refresh token to the used cookies
	 * @param response - user HTTP response object
	 * @param refreshToken - JWT refresh token
	 */
	public static setRefreshTokenCookie(response: Response, refreshToken: string): void {
		response.cookie(CookiesName.REFRESH_TOKEN, refreshToken, {
			maxAge: jwtConfig.refreshTokenExpiresIn * 1000,
			secure: process.env.NODE_ENV !== Environment.TEST,
			sameSite: 'strict',
			httpOnly: true,
		});
	}
}
