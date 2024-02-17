import { connectionSource } from '@DB/typeOrmConfig';
import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { passwordResetTokens } from '@TestMocks/PasswordResetTokenDto/passwordResetTokens';
import { FindOneOptions } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('passwordResetTokensRepository', (): void => {
	let passwordResetTokensRepository: PasswordResetTokensRepository;

	beforeEach((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(connectionSource);
	});

	describe('getByField', (): void => {
		let findMock: SpyInstance;

		const tokensMock: PasswordResetTokenDto[] = [...passwordResetTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const existingTokenValue: string = 'password-reset-token-1';
		const notExistingTokenValue: string = 'password-reset-token-5';

		beforeEach((): void => {
			findMock = jest
				.spyOn(passwordResetTokensRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<PasswordResetToken | null> => {
					return (
						(tokensMock.find((token: PasswordResetTokenDto) => {
							if (options.where!['id']) {
								return token.id === options.where!['id'];
							}

							if (options.where!['token']) {
								return token.token === options.where!['token'];
							}

							return false;
						}) as PasswordResetToken) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(passwordResetTokensRepository.getByField).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensRepository.getByField).toBeInstanceOf(Function);
		});

		it('should call findOne method for searching token by id, if id was passed as search field', async (): Promise<void> => {
			await passwordResetTokensRepository.getByField('id', existingTokenId);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { id: existingTokenId } });
		});

		it('should call findOne method for searching token by token value, if token was passed as search field', async (): Promise<void> => {
			await passwordResetTokensRepository.getByField('token', existingTokenValue);

			expect(findMock).toHaveBeenCalledTimes(1);
			expect(findMock).toHaveBeenCalledWith({ where: { token: existingTokenValue } });
		});

		it('should return founded token as instance of PasswordResetTokenDto', async (): Promise<void> => {
			const foundedToken: PasswordResetTokenDto | null =
				await passwordResetTokensRepository.getByField('id', existingTokenId);

			expect(foundedToken).toBeInstanceOf(PasswordResetTokenDto);
		});

		it('should find token by id if it exist', async (): Promise<void> => {
			const foundedToken: PasswordResetTokenDto | null =
				await passwordResetTokensRepository.getByField('id', existingTokenId);

			expect(foundedToken?.id).toBe(existingTokenId);
		});

		it('should return null if token with given id not exist', async (): Promise<void> => {
			const foundedToken: PasswordResetTokenDto | null =
				await passwordResetTokensRepository.getByField('id', notExistingTokenId);

			expect(foundedToken).toBeNull();
		});

		it('should find token by token value if it exist', async (): Promise<void> => {
			const foundedToken: PasswordResetTokenDto | null =
				await passwordResetTokensRepository.getByField('token', existingTokenValue);

			expect(foundedToken?.token).toBe(existingTokenValue);
		});

		it('should return null if token with given token value not exist', async (): Promise<void> => {
			const foundedToken: PasswordResetTokenDto | null =
				await passwordResetTokensRepository.getByField('token', notExistingTokenValue);

			expect(foundedToken).toBeNull();
		});
	});
});
