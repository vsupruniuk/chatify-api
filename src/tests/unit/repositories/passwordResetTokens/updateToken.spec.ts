import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, UpdateResult } from 'typeorm';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';

describe('Password reset tokens repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let passwordResetTokensRepository: PasswordResetTokensRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				{ provide: DataSource, useValue: queryBuilderMock },
				PasswordResetTokensRepository,
			],
		}).compile();

		passwordResetTokensRepository = moduleFixture.get(PasswordResetTokensRepository);
	});

	describe('Update token', (): void => {
		const expectedToken: PasswordResetToken = passwordResetTokens[0];
		const expectedUpdateResult: UpdateResult = { raw: [expectedToken], generatedMaps: [] };

		const idMock: string = expectedToken.id;
		const tokenMock: string = expectedToken.token as string;
		const expiresAtMock: string = expectedToken.expiresAt as string;

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue(expectedUpdateResult);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(passwordResetTokensRepository.updateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensRepository.updateToken).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query for updating password reset token', async (): Promise<void> => {
			await passwordResetTokensRepository.updateToken(idMock, tokenMock, expiresAtMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, PasswordResetToken);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, {
				token: tokenMock,
				expiresAt: expiresAtMock,
			});

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :id', { id: idMock });

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should return updated token', async (): Promise<void> => {
			const updatedToken: PasswordResetToken = await passwordResetTokensRepository.updateToken(
				idMock,
				tokenMock,
				expiresAtMock,
			);

			expect(updatedToken).toEqual(expectedToken);
		});
	});
});
