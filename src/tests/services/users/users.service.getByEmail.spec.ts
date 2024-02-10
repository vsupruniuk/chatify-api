import { connectionSource } from '@DB/typeOrmConfig';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { UserShortDto } from '@DTO/users/UserShort.dto';

import { UsersService } from '@Services/users.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

import { users } from '@TestMocks/UserShortDto/users';
import { TUserGetFields } from '@Types/users/TUserGetFields';

import SpyInstance = jest.SpyInstance;

describe('usersService', (): void => {
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;
	let accountSettingsRepository: IAccountSettingsRepository;
	let otpCodesRepository: IOTPCodesRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);
		otpCodesRepository = new OTPCodesRepository(connectionSource);

		usersService = new UsersService(accountSettingsRepository, otpCodesRepository, usersRepository);
	});

	describe('getByEmail', (): void => {
		let getUserByFieldMock: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';

		beforeEach((): void => {
			getUserByFieldMock = jest
				.spyOn(usersRepository, 'getByField')
				.mockImplementation(
					async (fieldName: TUserGetFields, fieldValue: string): Promise<UserShortDto | null> => {
						return (
							usersMock.find((user: UserShortDto) => {
								if (fieldName === 'id') {
									return user.id === fieldValue;
								}

								if (fieldName === 'email') {
									return user.email === fieldValue;
								}

								if (fieldName === 'nickname') {
									return user.nickname === fieldValue;
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
			expect(usersService.getByEmail).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByEmail).toBeInstanceOf(Function);
		});

		it('should use getByEmail method from users repository for searching user', async (): Promise<void> => {
			await usersService.getByEmail(existingUserEmail);

			expect(getUserByFieldMock).toHaveBeenCalledTimes(1);
			expect(getUserByFieldMock).toHaveBeenCalledWith('email', existingUserEmail);
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersService.getByEmail(existingUserEmail);

			expect(foundedUser?.email).toEqual(existingUserEmail);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersService.getByEmail(existingUserEmail);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null = await usersService.getByEmail(notExistingUserEmail);

			expect(foundedUser).toBeNull();
		});
	});
});
