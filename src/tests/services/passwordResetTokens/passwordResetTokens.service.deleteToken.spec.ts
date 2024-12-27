import { IPasswordResetTokensService } from '@Interfaces/passwordResetTokens/IPasswordResetTokens.service';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { connectionSource } from '@DB/typeOrmConfig';
import { PasswordResetTokensService } from '@Services/passwordResetTokens.service';
import { UsersRepository } from '@Repositories/users.repository';
import SpyInstance = jest.SpyInstance;
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@TestMocks/PasswordResetToken/passwordResetTokens';

describe('passwordResetTokensService', (): void => {
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
