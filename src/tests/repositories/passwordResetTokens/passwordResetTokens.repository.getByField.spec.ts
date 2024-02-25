import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { passwordResetTokens } from '@TestMocks/PasswordResetTokenDto/passwordResetTokens';
import { DataSource } from 'typeorm';

describe('passwordResetTokensRepository', (): void => {
	let passwordResetTokensRepository: PasswordResetTokensRepository;

	let resolvedValue: PasswordResetTokenDto | null = null;

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const getOneMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<PasswordResetTokenDto | null> => resolvedValue);

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				select: selectMock,
				from: fromMock,
				where: whereMock,
				getOne: getOneMock,
			};
		}),
	};

	beforeEach((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(dataSourceMock);
	});

	describe('getByField', (): void => {
		const tokensMock: PasswordResetTokenDto[] = [...passwordResetTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const existingTokenValue: string = 'password-reset-token-1';
		const notExistingTokenValue: string = 'password-reset-token-5';

		beforeEach((): void => {
			resolvedValue = null;
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(passwordResetTokensRepository.getByField).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensRepository.getByField).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find token by id', async (): Promise<void> => {
			await passwordResetTokensRepository.getByField('id', existingTokenId);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('passwordResetToken');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(PasswordResetToken, 'passwordResetToken');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('passwordResetToken.id = :fieldValue', {
				fieldValue: existingTokenId,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should use queryBuilder to build query and find token by token value', async (): Promise<void> => {
			await passwordResetTokensRepository.getByField('token', existingTokenValue);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('passwordResetToken');
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(PasswordResetToken, 'passwordResetToken');
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('passwordResetToken.token = :fieldValue', {
				fieldValue: existingTokenValue,
			});
			expect(getOneMock).toHaveBeenCalledTimes(1);
		});

		it('should return founded token as instance of PasswordResetTokenDto', async (): Promise<void> => {
			resolvedValue =
				tokensMock.find((token: PasswordResetTokenDto) => token.id === existingTokenId) || null;

			const foundedToken: PasswordResetTokenDto | null =
				await passwordResetTokensRepository.getByField('id', existingTokenId);

			expect(foundedToken).toBeInstanceOf(PasswordResetTokenDto);
		});

		it('should find token by id if it exist', async (): Promise<void> => {
			resolvedValue =
				tokensMock.find((token: PasswordResetTokenDto) => token.id === existingTokenId) || null;

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
			resolvedValue =
				tokensMock.find((token: PasswordResetTokenDto) => token.token === existingTokenValue) ||
				null;

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
