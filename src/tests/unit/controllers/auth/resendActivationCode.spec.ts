import { AuthController } from '@controllers/auth/auth.controller';
import { IAuthService } from '@services/auth/IAuthService';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomProviders } from '@enums/CustomProviders.enum';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode/ResendActivationCodeRequest.dto';

describe('Auth controller', (): void => {
	let authController: AuthController;
	let authService: IAuthService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AuthController,

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

	describe('Resend activation code', (): void => {
		const resendActivationCodeRequestDto: ResendActivationCodeRequestDto = {
			email: 't.stark@avengers.com',
		};

		beforeEach((): void => {
			jest.spyOn(authService, 'resendActivationCode').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.resendActivationCode).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.resendActivationCode).toBeInstanceOf(Function);
		});

		it('should call resend activation code method from auth service to send a new activation code for user', async (): Promise<void> => {
			await authController.resendActivationCode(resendActivationCodeRequestDto);

			expect(authService.resendActivationCode).toHaveBeenCalledTimes(1);
			expect(authService.resendActivationCode).toHaveBeenNthCalledWith(
				1,
				resendActivationCodeRequestDto,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authController.resendActivationCode(
				resendActivationCodeRequestDto,
			);

			expect(result).toBeUndefined();
		});
	});
});
