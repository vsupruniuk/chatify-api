import { connectionSource } from '@DB/typeOrmConfig';
import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { UsersService } from '@Services/users.service';
import { passwordResetTokens } from '@TestMocks/PasswordResetTokenDto/passwordResetTokens';
import { users } from '@TestMocks/UserFullDto/users';
import { TPasswordResetTokensGetFields } from '@Types/passwordResetTokens/TPasswordResetTokensGetFields';
import { TUserFullGetFields } from '@Types/users/TUserFullGetFields';
import SpyInstance = jest.SpyInstance;

describe('UsersService', (): void => {
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;
	let accountSettingsRepository: IAccountSettingsRepository;
	let otpCodesRepository: IOTPCodesRepository;
	let passwordResetTokensRepository: IPasswordResetTokensRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);
		otpCodesRepository = new OTPCodesRepository(connectionSource);
		passwordResetTokensRepository = new PasswordResetTokensRepository(connectionSource);

		usersService = new UsersService(
			accountSettingsRepository,
			otpCodesRepository,
			usersRepository,
			passwordResetTokensRepository,
		);
	});

	describe('getByResetPasswordToken', (): void => {
		let getTokenByFieldMock: SpyInstance;
		let getUserByField: SpyInstance;

		const passwordResetTokensMock: PasswordResetTokenDto[] = [...passwordResetTokens];
		const usersMock: UserFullDto[] = [...users];

		const existingToken: string = 'password-reset-token-1';
		const notExistingToken: string = 'password-reset-token-5';
		const existingTokenId: string = '1';

		beforeEach((): void => {
			getTokenByFieldMock = jest
				.spyOn(passwordResetTokensRepository, 'getByField')
				.mockImplementation(
					async (
						fieldName: TPasswordResetTokensGetFields,
						fieldValue: string,
					): Promise<PasswordResetTokenDto | null> => {
						return (
							passwordResetTokensMock.find((token: PasswordResetTokenDto) => {
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

			getUserByField = jest
				.spyOn(usersRepository, 'getFullUserByField')
				.mockImplementation(
					async (
						fieldName: TUserFullGetFields,
						fieldValue: string,
					): Promise<UserFullDto | null> => {
						return (
							usersMock.find((user: UserFullDto) => {
								if (fieldName === 'passwordResetTokenId') {
									return user.passwordResetTokenId === fieldValue;
								}

								return false;
							}) || null
						);
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getByResetPasswordToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByResetPasswordToken).toBeInstanceOf(Function);
		});

		it('should call getByField method in usersRepository to get user by token id', async (): Promise<void> => {
			await usersService.getByResetPasswordToken(existingToken);

			expect(getUserByField).toHaveBeenCalledTimes(1);
			expect(getUserByField).toHaveBeenCalledWith('passwordResetTokenId', existingTokenId);
		});

		it('should call getByField method in passwordResetTokensRepository to get full token instance by token value', async (): Promise<void> => {
			await usersService.getByResetPasswordToken(existingToken);

			expect(getTokenByFieldMock).toHaveBeenCalledTimes(1);
			expect(getTokenByFieldMock).toHaveBeenCalledWith('token', existingToken);
		});

		it('should return null if token with given value not exist', async (): Promise<void> => {
			const user: UserFullDto | null = await usersService.getByResetPasswordToken(notExistingToken);

			expect(user).toBeNull();
		});

		it('should return founded user if token with given value exist', async (): Promise<void> => {
			const user: UserFullDto | null = await usersService.getByResetPasswordToken(existingToken);

			expect(user?.passwordResetTokenId).toBe(existingTokenId);
		});

		it('should return user as instance of UserFullDto', async (): Promise<void> => {
			const user: UserFullDto | null = await usersService.getByResetPasswordToken(existingToken);

			expect(user).toBeInstanceOf(UserFullDto);
		});
	});
});
