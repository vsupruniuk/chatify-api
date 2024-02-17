import { connectionSource } from '@DB/typeOrmConfig';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { DeleteResult, FindOptionsWhere, ObjectId } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('passwordResetTokensRepository', (): void => {
	let passwordResetTokensRepository: PasswordResetTokensRepository;

	beforeEach((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(connectionSource);
	});

	describe('deleteToken', (): void => {
		let deleteMock: SpyInstance;

		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';

		beforeEach((): void => {
			deleteMock = jest
				.spyOn(passwordResetTokensRepository, 'delete')
				.mockImplementation(
					async <T>(
						criteria:
							| string
							| number
							| string[]
							| Date
							| ObjectId
							| number[]
							| Date[]
							| ObjectId[]
							| FindOptionsWhere<T>,
					): Promise<DeleteResult> => {
						const { id } = criteria as unknown as { id: string };

						return {
							raw: [],
							affected: id === existingTokenId ? 1 : 0,
						};
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(passwordResetTokensRepository.deleteToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensRepository.deleteToken).toBeInstanceOf(Function);
		});

		it('should call delete method to delete token', async (): Promise<void> => {
			await passwordResetTokensRepository.deleteToken(existingTokenId);

			expect(deleteMock).toHaveBeenCalledTimes(1);
			expect(deleteMock).toHaveBeenCalledWith({ id: existingTokenId });
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await passwordResetTokensRepository.deleteToken(notExistingTokenId);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was deleted', async (): Promise<void> => {
			const result: boolean = await passwordResetTokensRepository.deleteToken(existingTokenId);

			expect(result).toBe(true);
		});
	});
});
