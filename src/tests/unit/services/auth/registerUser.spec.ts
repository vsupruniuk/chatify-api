import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AuthService, IUsersService, IEmailService } from '@services';

import { providers } from '@modules/providers';

import { User } from '@entities';

import { users } from '@testMocks';

import { otpCodeConfig } from '@configs';

import { OTPCodesHelper, DateHelper } from '@helpers';

import { CustomProviders } from '@enums';

import { SignupRequestDto } from '@dtos/auth/signup';

describe('Auth service', (): void => {
	let authService: AuthService;
	let usersService: IUsersService;
	let emailService: IEmailService;

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
		usersService = moduleFixture.get(CustomProviders.CTF_USERS_SERVICE);
		emailService = moduleFixture.get(CustomProviders.CTF_EMAIL_SERVICE);
	});

	describe('Register user', (): void => {
		const userMock: User = users[4];
		const otpCodeMock: number = 123456;
		const otpCodeExpirationDateMock: string = '2025-05-03 16:36:00';

		const signupRequestDto: SignupRequestDto = {
			firstName: userMock.firstName,
			lastName: userMock.lastName as string,
			nickname: userMock.nickname,
			email: userMock.email,
			password: 'Qwerty12345!',
			passwordConfirmation: 'Qwerty12345!',
		};

		beforeEach((): void => {
			jest.spyOn(usersService, 'getByEmailOrNickname').mockResolvedValue(null);
			jest.spyOn(usersService, 'createUser').mockImplementation(jest.fn());

			jest.spyOn(OTPCodesHelper, 'generateOTPCode').mockReturnValue(otpCodeMock);
			jest.spyOn(DateHelper, 'dateTimeFuture').mockReturnValue(otpCodeExpirationDateMock);

			jest.spyOn(emailService, 'sendActivationEmail').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should call find by nickname or email method from users service to check if user tich provided email or nickname already exist', async (): Promise<void> => {
			await authService.registerUser(signupRequestDto);

			expect(usersService.getByEmailOrNickname).toHaveBeenCalledTimes(1);
			expect(usersService.getByEmailOrNickname).toHaveBeenNthCalledWith(
				1,
				signupRequestDto.email,
				signupRequestDto.nickname,
			);
		});

		it('should throw conflict exception if user with provided email or nickname already exist', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByEmailOrNickname').mockResolvedValue(userMock);

			await expect(authService.registerUser(signupRequestDto)).rejects.toThrow(ConflictException);
		});

		it('should throw error with messages that contains "email" if user with provided email exist', async (): Promise<void> => {
			jest
				.spyOn(usersService, 'getByEmailOrNickname')
				.mockResolvedValue({ ...userMock, nickname: 'test.nickname' });

			await expect(authService.registerUser(signupRequestDto)).rejects.toThrow(/email/);
		});

		it('should throw error with messages that contains "nickname" if user with provided nickname exist', async (): Promise<void> => {
			jest
				.spyOn(usersService, 'getByEmailOrNickname')
				.mockResolvedValue({ ...userMock, email: 'test@email.com' });

			await expect(authService.registerUser(signupRequestDto)).rejects.toThrow(/nickname/);
		});

		it('should use generate otp code method from otp code helper to generate an otp code for user', async (): Promise<void> => {
			await authService.registerUser(signupRequestDto);

			expect(OTPCodesHelper.generateOTPCode).toHaveBeenCalledTimes(1);
		});

		it('should use date time future from date helper to get otp code expiration date', async (): Promise<void> => {
			await authService.registerUser(signupRequestDto);

			expect(DateHelper.dateTimeFuture).toHaveBeenCalledTimes(1);
			expect(DateHelper.dateTimeFuture).toHaveBeenNthCalledWith(1, otpCodeConfig.ttl);
		});

		it('should use create user method from users service to create a user', async (): Promise<void> => {
			await authService.registerUser(signupRequestDto);

			expect(usersService.createUser).toHaveBeenCalledTimes(1);
			expect(usersService.createUser).toHaveBeenNthCalledWith(
				1,
				otpCodeMock,
				otpCodeExpirationDateMock,
				signupRequestDto,
			);
		});

		it('should call send activation email from email service to notify a user about account activation', async (): Promise<void> => {
			await authService.registerUser(signupRequestDto);

			expect(emailService.sendActivationEmail).toHaveBeenCalledTimes(1);
			expect(emailService.sendActivationEmail).toHaveBeenNthCalledWith(
				1,
				signupRequestDto.email,
				otpCodeMock,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authService.registerUser(signupRequestDto);

			expect(result).toBeUndefined();
		});
	});
});
