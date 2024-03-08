import { connectionSource } from '@DB/typeOrmConfig';
import { AppUserDto } from '@DTO/appUser/appUser.dto';
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
import { users } from '@TestMocks/User/users';
import { TUserGetFields } from '@Types/users/TUserGetFields';
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

	describe('getAppUser', (): void => {
		let getByFieldMock: SpyInstance;

		const usersMock: User[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b31111';

		beforeEach((): void => {
			getByFieldMock = jest
				.spyOn(usersRepository, 'getByField')
				.mockImplementation(
					async (fieldName: TUserGetFields, fieldValue: string): Promise<User | null> => {
						return (
							usersMock.find((user: User) => {
								if (fieldName === 'id') {
									return user.id === fieldValue;
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
			expect(usersService.getAppUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getAppUser).toBeInstanceOf(Function);
		});

		it('should use getByField method from users repository for searching user', async (): Promise<void> => {
			await usersService.getAppUser(existingUserId);

			expect(getByFieldMock).toHaveBeenCalledTimes(1);
			expect(getByFieldMock).toHaveBeenCalledWith('id', existingUserId);
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: AppUserDto | null = await usersService.getAppUser(existingUserId);

			expect(foundedUser?.id).toEqual(existingUserId);
		});

		it('should return founded user as instance of AppUserDto', async (): Promise<void> => {
			const foundedUser: AppUserDto | null = await usersService.getAppUser(existingUserId);

			expect(foundedUser).toBeInstanceOf(AppUserDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser: AppUserDto | null = await usersService.getAppUser(notExistingUserId);

			expect(foundedUser).toBeNull();
		});
	});
});
