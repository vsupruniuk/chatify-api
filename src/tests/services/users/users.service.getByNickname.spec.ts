import { connectionSource } from '@DB/typeOrmConfig';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { UserShortDto } from '@DTO/users/UserShort.dto';

import { UsersService } from '@Services/users.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

import { users } from '@TestMocks/UserResponseDto/users';

import SpyInstance = jest.SpyInstance;

describe('Users service', (): void => {
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

	describe('getByNickname', (): void => {
		let getUserByEmailNickname: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserNickname: string = 't.stark';
		const notExistingUserNickname: string = 'b.banner';

		beforeEach((): void => {
			getUserByEmailNickname = jest
				.spyOn(usersRepository, 'getByNickname')
				.mockImplementation(async (nickname: string): Promise<UserShortDto | null> => {
					return usersMock.find((user: UserShortDto) => user.nickname === nickname) || null;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersService.getByNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByNickname).toBeInstanceOf(Function);
		});

		it('should use getByEmail method from users repository for searching user', async (): Promise<void> => {
			await usersService.getByNickname(existingUserNickname);

			expect(getUserByEmailNickname).toHaveBeenCalledWith(existingUserNickname);
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto | null =
				await usersService.getByNickname(existingUserNickname);

			expect(foundedUser?.nickname).toEqual(existingUserNickname);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto | null =
				await usersService.getByNickname(existingUserNickname);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser = await usersService.getByNickname(notExistingUserNickname);

			expect(foundedUser).toBeNull();
		});
	});
});
