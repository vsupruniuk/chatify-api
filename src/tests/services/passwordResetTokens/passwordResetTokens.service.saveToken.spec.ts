import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { PasswordResetTokensService } from '@services/passwordResetToken/passwordResetTokens.service';
import { UsersRepository } from '@repositories/users/users.repository';
import { connectionSource } from '@db/typeOrmConfig';
import SpyInstance = jest.SpyInstance;
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';
import { PasswordResetTokenInfoDto } from '../../../types/dto/passwordResetTokens/passwordResetTokenInfo.dto';
import { TPasswordResetTokensGetFields } from '@custom-types/passwordResetTokens/TPasswordResetTokensGetFields';
import { PasswordResetTokensHelper } from '@helpers/passwordResetTokens.helper';

describe.skip('passwordResetTokensService', (): void => {
	let passwordResetTokensService: PasswordResetTokensService;
	let passwordResetTokensRepository: PasswordResetTokensRepository;
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		passwordResetTokensRepository = new PasswordResetTokensRepository(connectionSource);
		usersRepository = new UsersRepository(connectionSource);

		passwordResetTokensService = new PasswordResetTokensService(
			passwordResetTokensRepository,
			usersRepository,
		);
	});

	describe('saveToken', (): void => {
		let createTokenMock: SpyInstance;
		let updateTokenMock: SpyInstance;
		let generateTokenMock: SpyInstance;
		let getTokenByFieldMock: SpyInstance;
		let updateUserMock: SpyInstance;

		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const newTokenId: string = '4';
		const userIdMock: string = '1';
		const passwordResetTokensMock: PasswordResetToken[] = [...passwordResetTokens];
		const tokenMock: PasswordResetTokenInfoDto = {
			token: 'password-reset-token-1',
			expiresAt: new Date('2024-02-12 18:00:00').toISOString(),
		};

		beforeEach((): void => {
			createTokenMock = jest
				.spyOn(passwordResetTokensRepository, 'createToken')
				.mockImplementation(async (): Promise<string> => {
					return newTokenId;
				});

			updateTokenMock = jest
				.spyOn(passwordResetTokensRepository, 'updateToken')
				.mockImplementation(async (id: string): Promise<boolean> => {
					return id === existingTokenId;
				});

			getTokenByFieldMock = jest
				.spyOn(passwordResetTokensRepository, 'getByField')
				.mockImplementation(
					async (
						fieldName: TPasswordResetTokensGetFields,
						fieldValue: string,
					): Promise<PasswordResetToken | null> => {
						if (fieldName === 'id' && fieldValue === newTokenId) {
							return {
								id: newTokenId,
								...tokenMock,
							} as PasswordResetToken;
						}

						return (
							passwordResetTokensMock.find((token: PasswordResetToken) => {
								if (fieldName === 'id') {
									return token.id === fieldValue;
								}

								if (fieldName === 'token') {
									return token.token === fieldValue;
								}

								return false;
							}) || null
						);
					},
				);

			generateTokenMock = jest
				.spyOn(PasswordResetTokensHelper, 'generateToken')
				.mockImplementation((): PasswordResetTokenInfoDto => {
					return tokenMock;
				});

			updateUserMock = jest
				.spyOn(usersRepository, 'updateUser')
				.mockImplementation(async (userId: string): Promise<boolean> => {
					return userId === userIdMock;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(passwordResetTokensService.saveToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(passwordResetTokensService.saveToken).toBeInstanceOf(Function);
		});

		it('should call generateToken in passwordResetTokensHelper to generate token', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, existingTokenId);

			expect(generateTokenMock).toHaveBeenCalledTimes(1);
		});

		it('should call createToken and not call updateToken in passwordResetTokensRepository to create new token, if user does not have saved token', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, null);

			expect(createTokenMock).toHaveBeenCalledTimes(1);
			expect(createTokenMock).toHaveBeenCalledWith(tokenMock);
			expect(updateTokenMock).not.toHaveBeenCalled();
		});

		it('should call updateToken and not call createToken in passwordResetTokensRepository to update token, if user have saved token', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, existingTokenId);

			expect(updateTokenMock).toHaveBeenCalledTimes(1);
			expect(updateTokenMock).toHaveBeenCalledWith(existingTokenId, tokenMock);
			expect(createTokenMock).not.toHaveBeenCalled();
		});

		it('should call getById in passwordResetTokensRepository to find created token', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, null);

			expect(getTokenByFieldMock).toHaveBeenCalledTimes(1);
			expect(getTokenByFieldMock).toHaveBeenCalledWith('id', newTokenId);
		});

		it('should call getById in passwordResetTokensRepository to find updated token', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, existingTokenId);

			expect(getTokenByFieldMock).toHaveBeenCalledTimes(1);
			expect(getTokenByFieldMock).toHaveBeenCalledWith('id', existingTokenId);
		});

		it('should call updateUser in usersRepository to update user with new token id', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, null);

			expect(updateUserMock).toHaveBeenCalledTimes(1);
			expect(updateUserMock).toHaveBeenCalledWith(userIdMock, {
				passwordResetToken: { id: newTokenId, ...tokenMock },
			});
		});

		it('should not call updateUser in usersRepository if user already have token id', async (): Promise<void> => {
			await passwordResetTokensService.saveToken(userIdMock, existingTokenId);

			expect(updateUserMock).not.toHaveBeenCalled();
		});

		it('should return null if not existing token was passed', async (): Promise<void> => {
			const token: string | null = await passwordResetTokensService.saveToken(
				userIdMock,
				notExistingTokenId,
			);

			expect(token).toBeNull();
		});

		it('should return token if valid token id was passed', async (): Promise<void> => {
			const token: string | null = await passwordResetTokensService.saveToken(
				userIdMock,
				existingTokenId,
			);

			expect(token).toBe(tokenMock.token);
		});
	});
});
