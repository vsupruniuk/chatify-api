import { AuthService } from '@services/auth/auth.service';
import { IUsersService } from '@services/users/IUsersService';
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
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';

describe('Auth service', (): void => {
	let authService: AuthService;
	let usersService: IUsersService;

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
	});

	describe('Confirm reset password', (): void => {
		const userMock: User = users[4];
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[4];
		const password: string = 'Qwerty12345!';

		beforeEach((): void => {
			jest.spyOn(usersService, 'getByNotExpiredPasswordResetToken').mockResolvedValue({
				...userMock,
				passwordResetToken: { ...passwordResetTokenMock } as PasswordResetTokenDto,
			});

			jest.spyOn(usersService, 'changeUserPassword').mockResolvedValue(true);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by not expired password reset token method from users service to get a user', async (): Promise<void> => {
			await authService.confirmResetPassword(password, passwordResetTokenMock.token as string);

			expect(usersService.getByNotExpiredPasswordResetToken).toHaveBeenCalledTimes(1);
			expect(usersService.getByNotExpiredPasswordResetToken).toHaveBeenNthCalledWith(
				1,
				passwordResetTokenMock.token,
			);
		});

		it('should throw not found exception if user was not found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByNotExpiredPasswordResetToken').mockResolvedValue(null);

			await expect(
				authService.confirmResetPassword(password, passwordResetTokenMock.token as string),
			).rejects.toThrow(NotFoundException);
		});

		it('should call change user password method from users service to set a new password for user', async (): Promise<void> => {
			await authService.confirmResetPassword(password, passwordResetTokenMock.token as string);

			expect(usersService.changeUserPassword).toHaveBeenCalledTimes(1);
			expect(usersService.changeUserPassword).toHaveBeenNthCalledWith(
				1,
				userMock.id,
				passwordResetTokenMock.id,
				password,
			);
		});

		it('should throw unprocessable entity exception if users service failed to update the password', async (): Promise<void> => {
			jest.spyOn(usersService, 'changeUserPassword').mockResolvedValue(false);

			await expect(
				authService.confirmResetPassword(password, passwordResetTokenMock.token as string),
			).rejects.toThrow(UnprocessableEntityException);
		});
	});
});
