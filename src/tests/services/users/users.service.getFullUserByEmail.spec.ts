import { connectionSource } from '@DB/typeOrmConfig';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';

import { UsersService } from '@Services/users.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { users } from '@TestMocks/UserFullDto/users';
import { TUserFullGetFields } from '@Types/users/TUserFullGetFields';

import SpyInstance = jest.SpyInstance;

describe('usersService', (): void => {
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

	describe('getFullUserByEmail', (): void => {
		let getFullUserByEmailMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';

		beforeEach((): void => {
			getFullUserByEmailMock = jest
				.spyOn(usersRepository, 'getFullUserByField')
				.mockImplementation(
					async (
						fieldName: TUserFullGetFields,
						fieldValue: string,
					): Promise<UserFullDto | null> => {
						return (
							usersMock.find((user: UserFullDto) => {
								if (fieldName === 'id') {
									return user.id === fieldValue;
								}

								if (fieldName === 'email') {
									return user.email === fieldValue;
								}

								if (fieldName === 'nickname') {
									return user.nickname === fieldValue;
								}

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

		it('should be declared', (): void => {
			expect(usersService.getFullUserByEmail).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getFullUserByEmail).toBeInstanceOf(Function);
		});

		it('should use getFullUserById method from users repository for searching user', async (): Promise<void> => {
			await usersService.getFullUserByEmail(existingUserEmail);

			expect(getFullUserByEmailMock).toHaveBeenCalledTimes(1);
			expect(getFullUserByEmailMock).toHaveBeenCalledWith('email', existingUserEmail);
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null =
				await usersService.getFullUserByEmail(existingUserEmail);

			expect(foundedUser?.email).toEqual(existingUserEmail);
		});

		it('should return founded user as instance of UserFullDto', async (): Promise<void> => {
			const foundedUser: UserFullDto | null =
				await usersService.getFullUserByEmail(existingUserEmail);

			expect(foundedUser).toBeInstanceOf(UserFullDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null =
				await usersService.getFullUserByEmail(notExistingUserEmail);

			expect(foundedUser).toBeNull();
		});
	});
});
