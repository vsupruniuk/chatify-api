import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import SpyInstance = jest.SpyInstance;
import { IUsersService } from '@services/users/IUsersService';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@repositories/otpCode/IOTPCodesRepository';
import { UsersRepository } from '@repositories/users/users.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { OTPCodesRepository } from '@repositories/otpCode/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { UsersService } from '@services/users/users.service';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { TUserGetFields } from '@customTypes/types/users/TUserGetFields';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';

describe.skip('usersService', (): void => {
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
		let getByFieldMock: SpyInstance;

		const usersMock: User[] = [...users];
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';

		beforeEach((): void => {
			getByFieldMock = jest
				.spyOn(usersRepository, 'getByField')
				.mockImplementation(
					async (fieldName: TUserGetFields, fieldValue: string): Promise<User | null> => {
						return (
							usersMock.find((user: User) => {
								if (fieldName === 'email') {
									return user.email === fieldValue;
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

		it('should use getByField method from users repository for searching user', async (): Promise<void> => {
			await usersService.getFullUserByEmail(existingUserEmail);

			expect(getByFieldMock).toHaveBeenCalledTimes(1);
			expect(getByFieldMock).toHaveBeenCalledWith('email', existingUserEmail);
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
