import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { IPasswordResetTokensService } from '@services/passwordResetToken/IPasswordResetTokensService';
import { UsersRepository } from '@repositories/users/users.repository';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { PasswordResetTokensService } from '@services/passwordResetToken/passwordResetTokens.service';
import SpyInstance = jest.SpyInstance;
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';

describe.skip('passwordResetTokensService', (): void => {
	let passwordResetTokensService: IPasswordResetTokensService;
	let passwordResetTokensRepository: IPasswordResetTokensRepository;
	let usersRepository: UsersRepository;

	beforeAll((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(connectionSource);
		usersRepository = new UsersRepository(connectionSource);

		passwordResetTokensService = new PasswordResetTokensService(
			passwordResetTokensRepository,
			usersRepository,
		);
	});

	describe('deleteToken', (): void => {
		let deleteTokenMock: SpyInstance;

		const passwordResetTokensMock: PasswordResetToken[] = [...passwordResetTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '4';

		beforeEach((): void => {
			deleteTokenMock = jest
				.spyOn(passwordResetTokensRepository, 'deleteToken')
				.mockImplementation(async (id: string): Promise<boolean> => {
					return passwordResetTokensMock.some((token: PasswordResetToken) => token.id === id);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(passwordResetTokensService.deleteToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensService.deleteToken).toBeInstanceOf(Function);
		});

		it('should call deleteToken method from passwordResetTokens repository to delete token', async (): Promise<void> => {
			await passwordResetTokensService.deleteToken(existingTokenId);

			expect(deleteTokenMock).toHaveBeenCalledTimes(1);
			expect(deleteTokenMock).toHaveBeenCalledWith(existingTokenId);
		});

		it('should return true if token was deleted', async (): Promise<void> => {
			const isDeleted: boolean = await passwordResetTokensService.deleteToken(existingTokenId);

			expect(isDeleted).toBe(true);
		});

		it('should return false if token was not deleted', async (): Promise<void> => {
			const isDeleted: boolean = await passwordResetTokensService.deleteToken(notExistingTokenId);

			expect(isDeleted).toBe(false);
		});
	});
});
