import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';

import { AuthService, IEmailService, IUsersService, IOTPCodesService } from '@services';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { User, OTPCode } from '@entities';

import { users, otpCodes } from '@testMocks';

import { OTPCodeDto } from '@dtos/otpCode';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode';

describe('Auth service', (): void => {
	let authService: AuthService;
	let usersService: IUsersService;
	let otpCodesService: IOTPCodesService;
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
		otpCodesService = moduleFixture.get(CustomProviders.CTF_OTP_CODES_SERVICE);
		emailService = moduleFixture.get(CustomProviders.CTF_EMAIL_SERVICE);
	});

	describe('Resend activation code', (): void => {
		const userMock: User = users[3];
		const otpCodeMock: OTPCode = otpCodes[3];

		const resendActivationCodeRequestDto: ResendActivationCodeRequestDto = {
			email: userMock.email,
		};

		beforeEach((): void => {
			jest
				.spyOn(usersService, 'getByEmailAndNotActiveWithOtpCode')
				.mockResolvedValue({ ...userMock, otpCode: { ...otpCodeMock } as OTPCodeDto });

			jest.spyOn(otpCodesService, 'regenerateCode').mockResolvedValue(otpCodeMock.code);
			jest.spyOn(emailService, 'sendActivationEmail').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by email and not active with otp code method from users service to get user by email', async (): Promise<void> => {
			await authService.resendActivationCode(resendActivationCodeRequestDto);

			expect(usersService.getByEmailAndNotActiveWithOtpCode).toHaveBeenCalledTimes(1);
			expect(usersService.getByEmailAndNotActiveWithOtpCode).toHaveBeenNthCalledWith(
				1,
				resendActivationCodeRequestDto.email,
			);
		});

		it('should throw not found exception if users service failed to find a user', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByEmailAndNotActiveWithOtpCode').mockResolvedValue(null);

			await expect(
				authService.resendActivationCode(resendActivationCodeRequestDto),
			).rejects.toThrow(NotFoundException);
		});

		it('should call regenerate code from otp codes service to generate and update user otp code', async (): Promise<void> => {
			await authService.resendActivationCode(resendActivationCodeRequestDto);

			expect(otpCodesService.regenerateCode).toHaveBeenCalledTimes(1);
			expect(otpCodesService.regenerateCode).toHaveBeenNthCalledWith(1, otpCodeMock.id);
		});

		it('should throw unprocessable entity exception if otp codes service failed to regenerate otp code', async (): Promise<void> => {
			jest.spyOn(otpCodesService, 'regenerateCode').mockResolvedValue(null);

			await expect(
				authService.resendActivationCode(resendActivationCodeRequestDto),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should call send activation email from email service to send a new otp code to user', async (): Promise<void> => {
			await authService.resendActivationCode(resendActivationCodeRequestDto);

			expect(emailService.sendActivationEmail).toHaveBeenCalledTimes(1);
			expect(emailService.sendActivationEmail).toHaveBeenNthCalledWith(
				1,
				resendActivationCodeRequestDto.email,
				otpCodeMock.code,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authService.resendActivationCode(resendActivationCodeRequestDto);

			expect(result).toBeUndefined();
		});
	});
});
