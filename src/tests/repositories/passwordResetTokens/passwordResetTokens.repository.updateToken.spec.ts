import { PasswordResetTokensRepository } from '@repositories/passwordResetTokens.repository';
import { DataSource, UpdateResult } from 'typeorm';
import { TUpdatePasswordResetToken } from '@custom-types/passwordResetTokens/TUpdatePasswordResetToken';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';

describe.skip('passwordResetTokensRepository', (): void => {
	let passwordResetTokensRepository: PasswordResetTokensRepository;

	let resolvedAffectedValue: number = 0;

	const updateMock: jest.Mock = jest.fn().mockReturnThis();
	const setMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<UpdateResult> => {
		return <UpdateResult>{
			raw: [],
			affected: resolvedAffectedValue,
			generatedMaps: [],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				update: updateMock,
				set: setMock,
				where: whereMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(dataSourceMock);
	});

	describe('updateToken', (): void => {
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const updateTokenMock: TUpdatePasswordResetToken = {
			token: 'new-token',
			expiresAt: '2024-02-12 17:00:00',
		};

		beforeEach((): void => {
			resolvedAffectedValue = 0;
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(passwordResetTokensRepository.updateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensRepository.updateToken).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and update token', async (): Promise<void> => {
			await passwordResetTokensRepository.updateToken(existingTokenId, updateTokenMock);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith(PasswordResetToken);
			expect(setMock).toHaveBeenCalledTimes(1);
			expect(setMock).toHaveBeenCalledWith(updateTokenMock);
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('id = :id', { id: existingTokenId });
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await passwordResetTokensRepository.updateToken(
				notExistingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was updated', async (): Promise<void> => {
			resolvedAffectedValue = 1;

			const result: boolean = await passwordResetTokensRepository.updateToken(
				existingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(true);
		});
	});
});
