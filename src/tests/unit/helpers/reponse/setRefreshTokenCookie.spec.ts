import { Response } from 'express';
import { ResponseHelper } from '@helpers/response.helper';
import { CookiesNames } from '@enums/CookiesNames.enum';

describe('Response helper', (): void => {
	const jwtRefreshTokenExpiresInMock: string = '1000';

	beforeAll((): void => {
		process.env.JWT_REFRESH_TOKEN_EXPIRES_IN = jwtRefreshTokenExpiresInMock;
	});

	afterAll((): void => {
		delete process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;
	});

	describe('Set refresh token cookie', (): void => {
		const refreshToken: string = 'refreshToken';
		const response: Response = {
			cookie: jest.fn(),
		} as unknown as Response;

		it('should be defined', (): void => {
			expect(ResponseHelper.setRefreshTokenCookie).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(ResponseHelper.setRefreshTokenCookie).toBeInstanceOf(Function);
		});

		it('should call cookie method in the response object to save refresh token in cookies', (): void => {
			ResponseHelper.setRefreshTokenCookie(response, refreshToken);

			expect(response.cookie).toHaveBeenCalledTimes(1);
			expect(response.cookie).toHaveBeenNthCalledWith(1, CookiesNames.REFRESH_TOKEN, refreshToken, {
				maxAge: Number(jwtRefreshTokenExpiresInMock) * 1000,
				secure: true,
				sameSite: 'strict',
				httpOnly: true,
			});
		});
	});
});
