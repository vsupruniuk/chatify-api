import { AuthController } from '@controllers/auth/auth.controller';
import { IAuthService } from '@services/auth/IAuthService';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomProviders } from '@enums/CustomProviders.enum';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordConfirmationRequestDto } from '@dtos/auth/resetPasswordConfirmation/ResetPasswordConfirmationRequest.dto';

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

		it('should be defined', (): void => {
			expect(authController.resetPasswordConfirmation).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.resetPasswordConfirmation).toBeInstanceOf(Function);
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
