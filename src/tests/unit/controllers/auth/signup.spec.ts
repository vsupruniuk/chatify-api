import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AuthController } from '@controllers';

import { IAuthService } from '@services';

import { CustomProvider } from '@enums';

import { providers } from '@modules/providers';

import { SignupRequestDto } from '@dtos/auth/signup';

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
		authService = moduleFixture.get(CustomProvider.CTF_AUTH_SERVICE);
	});

	describe('Signup', (): void => {
		const signupRequestDto: SignupRequestDto = {
			firstName: 'Tony',
			lastName: 'Stark',
			email: 't.stark@avengers.com',
			nickname: 't.stark',
			password: 'Qwerty12345!',
			passwordConfirmation: 'Qwerty12345!',
		};

		beforeEach((): void => {
			jest.spyOn(authService, 'registerUser').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call register user method from auth service to create user account', async (): Promise<void> => {
			await authController.signup(signupRequestDto);

			expect(authService.registerUser).toHaveBeenCalledTimes(1);
			expect(authService.registerUser).toHaveBeenNthCalledWith(1, signupRequestDto);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authController.signup(signupRequestDto);

			expect(result).toBeUndefined();
		});
	});
});
