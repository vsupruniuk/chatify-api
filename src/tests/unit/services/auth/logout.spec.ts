import { UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AuthService, IJWTTokensService } from '@services';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { User } from '@entities';

import { users, jwtTokens } from '@testMocks';

describe('Auth service', (): void => {
	let authService: AuthService;
	let jwtTokensService: IJWTTokensService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,

				JwtService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_EMAIL_SERVICE,
				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_OTP_CODES_SERVICE,
				providers.CTF_PASSWORD_RESET_TOKENS_SERVICE,

				providers.CTF_USERS_REPOSITORY,
				providers.CTF_JWT_TOKENS_REPOSITORY,
				providers.CTF_OTP_CODES_REPOSITORY,
				providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		authService = moduleFixture.get(AuthService);
		jwtTokensService = moduleFixture.get(CustomProviders.CTF_JWT_TOKENS_SERVICE);
	});

	describe('Logout', (): void => {
		const userMock: User = users[5];
		const refreshToken: string = jwtTokens[0].token as string;

		beforeEach((): void => {
			jest.spyOn(jwtTokensService, 'verifyRefreshToken').mockResolvedValue(null);
			jest.spyOn(jwtTokensService, 'resetUserToken').mockResolvedValue(true);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call verify refresh token method from jwt tokens service to verify provided refresh token', async (): Promise<void> => {
			await authService.logout(refreshToken);

			expect(jwtTokensService.verifyRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.verifyRefreshToken).toHaveBeenNthCalledWith(1, refreshToken);
		});

		it('should not call reset user token method from jwt tokens service if refresh token is not valid', async (): Promise<void> => {
			await authService.logout(refreshToken);

			expect(jwtTokensService.resetUserToken).not.toHaveBeenCalled();
		});

		it('should call reset user token method from jwt tokens service if refresh token is valid', async (): Promise<void> => {
			jest.spyOn(jwtTokensService, 'verifyRefreshToken').mockResolvedValue(userMock);

			await authService.logout(refreshToken);

			expect(jwtTokensService.resetUserToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.resetUserToken).toHaveBeenNthCalledWith(1, userMock.id);
		});

		it('should throw unprocessable entity exception if jwt tokens service failed to reset user token', async (): Promise<void> => {
			jest.spyOn(jwtTokensService, 'verifyRefreshToken').mockResolvedValue(userMock);
			jest.spyOn(jwtTokensService, 'resetUserToken').mockResolvedValue(false);

			await expect(authService.logout(refreshToken)).rejects.toThrow(UnprocessableEntityException);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authService.logout(refreshToken);

			expect(result).toBeUndefined();
		});
	});
});
