import { AuthController } from '@controllers/auth/auth.controller';
import { IAuthService } from '@services/auth/IAuthService';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomProviders } from '@enums/CustomProviders.enum';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { CookiesNames } from '@enums/CookiesNames.enum';

describe('Auth controller', (): void => {
	let authController: AuthController;
	let authService: IAuthService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				providers.CTF_AUTH_SERVICE,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_OTP_CODES_SERVICE,
				providers.CTF_OTP_CODES_REPOSITORY,

				providers.CTF_PASSWORD_RESET_TOKENS_SERVICE,
				providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,

				providers.CTF_EMAIL_SERVICE,

				JwtService,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		authController = moduleFixture.get(AuthController);
		authService = moduleFixture.get(CustomProviders.CTF_AUTH_SERVICE);
	});

	describe('Logout', (): void => {
		const response: Response = { clearCookie: jest.fn() } as unknown as Response;
		const refreshToken: string = 'refreshToken';

		beforeEach((): void => {
			jest.spyOn(authService, 'logout').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call logout method from auth service to proceed user logout', async (): Promise<void> => {
			await authController.logout(response, refreshToken);

			expect(authService.logout).toHaveBeenCalledTimes(1);
			expect(authService.logout).toHaveBeenNthCalledWith(1, refreshToken);
		});

		it('should call clear cookie method from response object to clear user cookie with refresh token', async (): Promise<void> => {
			await authController.logout(response, refreshToken);

			expect(response.clearCookie).toHaveBeenCalledTimes(1);
			expect(response.clearCookie).toHaveBeenNthCalledWith(1, CookiesNames.REFRESH_TOKEN);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authController.logout(response, refreshToken);

			expect(result).toBeUndefined();
		});
	});
});
