import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';

import { AuthController } from '@controllers';

import { IAuthService } from '@services';

import { CustomProviders } from '@enums';

import { providers } from '@modules/providers';

import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword';

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

	describe('Reset password', (): void => {
		const resetPasswordRequestDto: ResetPasswordRequestDto = { email: 'b.banner@avengers.com' };

		beforeEach((): void => {
			jest.spyOn(authService, 'resetPassword').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call reset password method from auth service to create and send to user password reset token', async (): Promise<void> => {
			await authController.resetPassword(resetPasswordRequestDto);

			expect(authService.resetPassword).toHaveBeenCalledTimes(1);
			expect(authService.resetPassword).toHaveBeenNthCalledWith(1, resetPasswordRequestDto);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authController.resetPassword(resetPasswordRequestDto);

			expect(result).toBeUndefined();
		});
	});
});
