import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { DataSource, InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { PasswordResetTokenInfoDto } from '../../../types/dto/passwordResetTokens/passwordResetTokenInfo.dto';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';

describe.skip('passwordResetTokensRepository', (): void => {
	let passwordResetTokenRepository: PasswordResetTokensRepository;

	const insertMock: jest.Mock = jest.fn().mockReturnThis();
	const intoMock: jest.Mock = jest.fn().mockReturnThis();
	const valuesMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<InsertResult> => {
		return <InsertResult>{
			identifiers: <ObjectLiteral>[{ id: '10' }],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				insert: insertMock,
				into: intoMock,
				values: valuesMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		passwordResetTokenRepository = new PasswordResetTokensRepository(dataSourceMock);
	});

	describe('createToken', (): void => {
		const idMock: string = '10';
		const createTokenMock: PasswordResetTokenInfoDto = {
			token: 'password-reset-token',
			expiresAt: '2024-02-12 16:00:00',
		};

		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(passwordResetTokenRepository.createToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokenRepository.createToken).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query for creating token', async (): Promise<void> => {
			await passwordResetTokenRepository.createToken(createTokenMock);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledTimes(1);
			expect(intoMock).toHaveBeenCalledWith(PasswordResetToken);
			expect(valuesMock).toHaveBeenCalledTimes(1);
			expect(valuesMock).toHaveBeenCalledWith(createTokenMock);
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return id of created token', async (): Promise<void> => {
			const id: string = await passwordResetTokenRepository.createToken(createTokenMock);

			expect(id).toBe(idMock);
		});
	});
});
