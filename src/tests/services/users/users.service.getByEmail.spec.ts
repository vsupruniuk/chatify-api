import { connectionSource } from '@DB/typeOrmConfig';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IStatusesRepository } from '@Interfaces/statuses/IStatusesRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { UserShortDto } from '@DTO/users/UserShort.dto';

import { UsersService } from '@Services/users.service';
import { StatusesRepository } from '@Repositories/statuses.repository';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

import { users } from '@TestMocks/UserResponseDto/users';

import SpyInstance = jest.SpyInstance;

describe('Users service', (): void => {
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;
	let statusesRepository: IStatusesRepository;
	let accountSettingsRepository: IAccountSettingsRepository;
	let otpCodesRepository: IOTPCodesRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
		statusesRepository = new StatusesRepository(connectionSource);
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);
		otpCodesRepository = new OTPCodesRepository(connectionSource);

		usersService = new UsersService(
			accountSettingsRepository,
			statusesRepository,
			otpCodesRepository,
			usersRepository,
		);
	});

	describe('getByEmail', (): void => {
		let getUserByEmailMock: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';

		beforeEach((): void => {
			getUserByEmailMock = jest
				.spyOn(usersRepository, 'getByEmail')
				.mockImplementation(async (email: string): Promise<UserShortDto | null> => {
					return usersMock.find((user: UserShortDto) => user.email === email) || null;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersService.getByEmail).toBeDefined();
		});

		it('should use getByEmail method from users repository for searching user', async (): Promise<void> => {
			await usersService.getByEmail(existingUserEmail);

			expect(getUserByEmailMock).toHaveBeenCalledWith(existingUserEmail);
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersService.getByEmail(existingUserEmail);

			expect(foundedUser.email).toEqual(existingUserEmail);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersService.getByEmail(existingUserEmail);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser = await usersService.getByEmail(notExistingUserEmail);

			expect(foundedUser).toBeNull();
		});
	});
});
