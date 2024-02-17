import { connectionSource } from '@DB/typeOrmConfig';
import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import SpyInstance = jest.SpyInstance;

describe('passwordResetTokensRepository', (): void => {
	let passwordResetTokenRepository: PasswordResetTokensRepository;

	beforeEach((): void => {
		passwordResetTokenRepository = new PasswordResetTokensRepository(connectionSource);
	});

	describe('createToken', (): void => {
		let insertMock: SpyInstance;
		const idMock: string = '10';
		const createTokenMock: Omit<PasswordResetTokenDto, 'id'> = {
			token: 'password-reset-token',
			expiresAt: '2024-02-12 16:00:00',
		};

		beforeEach((): void => {
			insertMock = jest.spyOn(passwordResetTokenRepository, 'insert').mockResolvedValue(
				Promise.resolve(<InsertResult>{
					identifiers: <ObjectLiteral>[{ id: idMock }],
				}),
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(passwordResetTokenRepository.createToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokenRepository.createToken).toBeInstanceOf(Function);
		});

		it('should call insert method to create a new token', async (): Promise<void> => {
			await passwordResetTokenRepository.createToken(createTokenMock);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(insertMock).toHaveBeenCalledWith(createTokenMock);
		});

		it('should return id of created token', async (): Promise<void> => {
			const id: string = await passwordResetTokenRepository.createToken(createTokenMock);

			expect(id).toBe(idMock);
		});
	});
});
