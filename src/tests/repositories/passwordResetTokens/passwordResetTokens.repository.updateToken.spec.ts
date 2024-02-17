import { connectionSource } from '@DB/typeOrmConfig';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { TUpdatePasswordResetToken } from '@Types/passwordResetTokens/TUpdatePasswordResetToken';
import { FindOptionsWhere, ObjectId, UpdateResult } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('passwordResetTokensRepository', (): void => {
	let passwordResetTokensRepository: PasswordResetTokensRepository;

	beforeEach((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(connectionSource);
	});

	describe('updateToken', (): void => {
		let updateMock: SpyInstance;

		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const updateTokenMock: TUpdatePasswordResetToken = {
			token: 'new-token',
			expiresAt: '2024-02-12 17:00:00',
		};

		beforeEach((): void => {
			updateMock = jest
				.spyOn(passwordResetTokensRepository, 'update')
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
					): Promise<UpdateResult> => {
						const { id } = criteria as unknown as { id: string };

						return <UpdateResult>{
							raw: [],
							affected: id === existingTokenId ? 1 : 0,
							generatedMaps: [],
						};
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(passwordResetTokensRepository.updateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensRepository.updateToken).toBeInstanceOf(Function);
		});

		it('should call update method to update token', async (): Promise<void> => {
			await passwordResetTokensRepository.updateToken(existingTokenId, updateTokenMock);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith({ id: existingTokenId }, updateTokenMock);
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await passwordResetTokensRepository.updateToken(
				notExistingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was updated', async (): Promise<void> => {
			const result: boolean = await passwordResetTokensRepository.updateToken(
				existingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(true);
		});
	});
});
