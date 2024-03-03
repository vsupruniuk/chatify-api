import { connectionSource } from '@DB/typeOrmConfig';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { User } from '@Entities/User.entity';
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
import { passwordResetTokens } from '@TestMocks/PasswordResetToken/passwordResetTokens';
import { users } from '@TestMocks/User/users';
import { TPasswordResetTokensGetFields } from '@Types/passwordResetTokens/TPasswordResetTokensGetFields';
import { TUserGetFields } from '@Types/users/TUserGetFields';
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

		const passwordResetTokensMock: PasswordResetToken[] = [...passwordResetTokens];
		const usersMock: User[] = [...users];

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
					): Promise<PasswordResetToken | null> => {
						return (
							passwordResetTokensMock.find((token: PasswordResetToken) => {
								if (fieldName === 'token') {
									return token.token === fieldValue;
								}

								return false;
							}) || null
						);
					},
				);

			getUserByField = jest
				.spyOn(usersRepository, 'getByField')
				.mockImplementation(
					async (fieldName: TUserGetFields, fieldValue: string): Promise<User | null> => {
						return (
							usersMock.find((user: User) => {
								if (fieldName === 'passwordResetTokenId') {
									return user.passwordResetToken?.id === fieldValue || false;
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

			expect(user?.passwordResetToken?.id).toBe(existingTokenId);
		});

		it('should return user as instance of UserFullDto', async (): Promise<void> => {
			const user: UserFullDto | null = await usersService.getByResetPasswordToken(existingToken);

			expect(user).toBeInstanceOf(UserFullDto);
		});
	});
});
