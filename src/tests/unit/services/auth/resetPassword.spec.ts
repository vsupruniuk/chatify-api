import { AuthService } from '@services/auth/auth.service';
import { IUsersService } from '@services/users/IUsersService';
import { IEmailService } from '@services/email/IEmailService';
import { IPasswordResetTokensService } from '@services/passwordResetToken/IPasswordResetTokensService';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';
import { PasswordResetTokenDto } from '@dtos/passwordResetToken/PasswordResetToken.dto';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword/ResetPasswordRequest.dto';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

describe('Auth service', (): void => {
	let authService: AuthService;
	let usersService: IUsersService;
	let passwordResetTokensService: IPasswordResetTokensService;
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
		passwordResetTokensService = moduleFixture.get(
			CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE,
		);
		emailService = moduleFixture.get(CustomProviders.CTF_EMAIL_SERVICE);
	});

	describe('Reset password', (): void => {
		const userMock: User = users[4];
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[4];

		const resetPasswordRequestDto: ResetPasswordRequestDto = { email: userMock.email };

		beforeEach((): void => {
			jest.spyOn(usersService, 'getByEmailWithPasswordResetToken').mockResolvedValue({
				...userMock,
				passwordResetToken: { ...passwordResetTokenMock } as PasswordResetTokenDto,
			});
			jest
				.spyOn(passwordResetTokensService, 'regenerateToken')
				.mockResolvedValue(passwordResetTokenMock.token);
			jest.spyOn(emailService, 'sendResetPasswordEmail').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(authService.resetPassword).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authService.resetPassword).toBeInstanceOf(Function);
		});

		it('should call get by email with password reset token method from users service to find user', async (): Promise<void> => {
			await authService.resetPassword(resetPasswordRequestDto);

			expect(usersService.getByEmailWithPasswordResetToken).toHaveBeenCalledTimes(1);
			expect(usersService.getByEmailWithPasswordResetToken).toHaveBeenNthCalledWith(
				1,
				resetPasswordRequestDto.email,
			);
		});

		it('should throw not found exception if user service failed to find user by email', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByEmailWithPasswordResetToken').mockResolvedValue(null);

			await expect(authService.resetPassword(resetPasswordRequestDto)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should call regenerate token method from password reset tokens service to update user token', async (): Promise<void> => {
			await authService.resetPassword(resetPasswordRequestDto);

			expect(passwordResetTokensService.regenerateToken).toHaveBeenCalledTimes(1);
			expect(passwordResetTokensService.regenerateToken).toHaveBeenNthCalledWith(
				1,
				passwordResetTokenMock.id,
			);
		});

		it('should throw unprocessable entity exception in failed to update user password reset token', async (): Promise<void> => {
			jest.spyOn(passwordResetTokensService, 'regenerateToken').mockResolvedValue(null);

			await expect(authService.resetPassword(resetPasswordRequestDto)).rejects.toThrow(
				UnprocessableEntityException,
			);
		});

		it('should call send password reset email method from email service to send a token to the user', async (): Promise<void> => {
			await authService.resetPassword(resetPasswordRequestDto);

			expect(emailService.sendResetPasswordEmail).toHaveBeenCalledTimes(1);
			expect(emailService.sendResetPasswordEmail).toHaveBeenNthCalledWith(
				1,
				userMock.email,
				userMock.firstName,
				passwordResetTokenMock.token,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await authService.resetPassword(resetPasswordRequestDto);

			expect(result).toBeUndefined();
		});
	});
});
