import { PasswordResetTokensService } from '@services/passwordResetToken/passwordResetTokens.service';
import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';
import { PasswordResetTokensHelper } from '@helpers/passwordResetTokens.helper';
import { DateHelper } from '@helpers/date.helper';
import { passwordResetTokenConfig } from '@configs/passwordResetToken.config';

describe('Password reset tokens service', (): void => {
	let passwordResetTokensService: PasswordResetTokensService;
	let passwordResetTokensRepository: IPasswordResetTokensRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				PasswordResetTokensService,

				providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		passwordResetTokensService = moduleFixture.get(PasswordResetTokensService);
		passwordResetTokensRepository = moduleFixture.get(
			CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,
		);
	});

	describe('Regenerate token', (): void => {
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[1];
		const token: string = passwordResetTokenMock.token as string;
		const tokenExpirationDate: string = passwordResetTokenMock.expiresAt as string;

		const id: string = passwordResetTokenMock.id;

		beforeEach((): void => {
			jest.spyOn(PasswordResetTokensHelper, 'generateToken').mockReturnValue(token);
			jest.spyOn(DateHelper, 'dateTimeFuture').mockReturnValue(tokenExpirationDate);

			jest
				.spyOn(passwordResetTokensRepository, 'updateToken')
				.mockResolvedValue(passwordResetTokenMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(passwordResetTokensService.regenerateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensService.regenerateToken).toBeInstanceOf(Function);
		});

		it('should call generate token method from password reset tokens helper to generate new token', async (): Promise<void> => {
			await passwordResetTokensService.regenerateToken(id);

			expect(PasswordResetTokensHelper.generateToken).toHaveBeenCalledTimes(1);
		});

		it('should call date time future method from date helper to generate new expiration date', async (): Promise<void> => {
			await passwordResetTokensService.regenerateToken(id);

			expect(DateHelper.dateTimeFuture).toHaveBeenCalledTimes(1);
			expect(DateHelper.dateTimeFuture).toHaveBeenNthCalledWith(1, passwordResetTokenConfig.ttl);
		});

		it('should call update token from password reset tokens repository to update user token', async (): Promise<void> => {
			await passwordResetTokensService.regenerateToken(id);

			expect(passwordResetTokensRepository.updateToken).toHaveBeenCalledTimes(1);
			expect(passwordResetTokensRepository.updateToken).toHaveBeenNthCalledWith(
				1,
				id,
				token,
				tokenExpirationDate,
			);
		});

		it('should return new token if it was successfully updated', async (): Promise<void> => {
			const updatedToken: string | null = await passwordResetTokensService.regenerateToken(id);

			expect(updatedToken).toBe(token);
		});

		it('should return null if token was not updated', async (): Promise<void> => {
			jest
				.spyOn(passwordResetTokensRepository, 'updateToken')
				.mockResolvedValue({ ...passwordResetTokenMock, token: null });

			const updatedToken: string | null = await passwordResetTokensService.regenerateToken(id);

			expect(updatedToken).toBeNull();
		});
	});
});
