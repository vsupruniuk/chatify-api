import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { IUsersService } from '@services/users/IUsersService';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@repositories/otpCodes/IOTPCodesRepository';
import { UsersRepository } from '@repositories/users/users.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { UsersService } from '@services/users/users.service';
import SpyInstance = jest.SpyInstance;
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { TPasswordResetTokensGetFields } from '@customTypes/types/passwordResetTokens/TPasswordResetTokensGetFields';
import { TUserGetFields } from '@customTypes/types/users/TUserGetFields';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';

describe.skip('UsersService', (): void => {
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
			jest.useFakeTimers();

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
			jest.useRealTimers();
		});

		it('should be defined', (): void => {
			expect(usersService.getByResetPasswordToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByResetPasswordToken).toBeInstanceOf(Function);
		});

		it('should call getByField method in usersRepository to get user by token id', async (): Promise<void> => {
			jest.setSystemTime(new Date('2024-02-12 15:55:00'));

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

		it('should return null if token expired', async (): Promise<void> => {
			jest.setSystemTime(new Date('2024-02-12 17:00:00'));

			const user: UserFullDto | null = await usersService.getByResetPasswordToken(existingToken);

			expect(user).toBeNull();
		});

		it('should return founded user if token with given value exist', async (): Promise<void> => {
			jest.setSystemTime(new Date('2024-02-12 15:55:00'));

			const user: UserFullDto | null = await usersService.getByResetPasswordToken(existingToken);

			expect(user?.passwordResetToken?.id).toBe(existingTokenId);
		});

		it('should return user as instance of UserFullDto', async (): Promise<void> => {
			jest.setSystemTime(new Date('2024-02-12 15:55:00'));

			const user: UserFullDto | null = await usersService.getByResetPasswordToken(existingToken);

			expect(user).toBeInstanceOf(UserFullDto);
		});
	});
});
