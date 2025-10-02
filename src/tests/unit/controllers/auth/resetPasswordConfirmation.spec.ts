import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AuthController } from '@controllers';

import { IAuthService } from '@services';

import { CustomProviders } from '@enums';

import { providers } from '@modules/providers';

import { ResetPasswordConfirmationRequestDto } from '@dtos/auth/resetPasswordConfirmation';

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

	describe('Reset password confirmation', (): void => {
		const resetPasswordConfirmationRequestDto: ResetPasswordConfirmationRequestDto = {
			password: 'Qwerty12345!',
			passwordConfirmation: 'Qwerty12345!',
		};
		const passwordResetToken: string = 'passwordResetToken';

		beforeEach((): void => {
			jest.spyOn(authService, 'confirmResetPassword').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call confirm reset password to change user password', async (): Promise<void> => {
			await authController.resetPasswordConfirmation(
				resetPasswordConfirmationRequestDto,
				passwordResetToken,
			);

			expect(authService.confirmResetPassword).toHaveBeenCalledTimes(1);
			expect(authService.confirmResetPassword).toHaveBeenNthCalledWith(
				1,
				resetPasswordConfirmationRequestDto.password,
				passwordResetToken,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authController.resetPasswordConfirmation(
				resetPasswordConfirmationRequestDto,
				passwordResetToken,
			);

			expect(result).toBeUndefined();
		});
	});
});
