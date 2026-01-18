import { Response } from 'express';

import { ResponseHelper } from '@helpers';

import { CookiesName, Environment } from '@enums';

describe('Response helper', (): void => {
	const jwtRefreshTokenExpiresInMock: number = Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN);
	const nodeEnvironmentMock: Environment = Environment.PROD;

	beforeAll((): void => {
		process.env.NODE_ENV = nodeEnvironmentMock;
	});

	afterAll((): void => {
		delete process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;
		delete process.env.NODE_ENV;
	});

	describe('Set refresh token cookie', (): void => {
		const refreshToken: string = 'refreshToken';
		const response: Response = {
			cookie: jest.fn(),
		} as unknown as Response;

		it('should call cookie method in the response object to save refresh token in cookies', (): void => {
			ResponseHelper.setRefreshTokenCookie(response, refreshToken);

			expect(response.cookie).toHaveBeenCalledTimes(1);
			expect(response.cookie).toHaveBeenNthCalledWith(1, CookiesName.REFRESH_TOKEN, refreshToken, {
				maxAge: jwtRefreshTokenExpiresInMock * 1000,
				secure: true,
				sameSite: 'strict',
				httpOnly: true,
			});
		});
	});
});
