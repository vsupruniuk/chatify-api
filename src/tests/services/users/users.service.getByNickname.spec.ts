import { connectionSource } from '@DB/typeOrmConfig';
import { User } from '@Entities/User.entity';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { UsersService } from '@Services/users.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { users } from '@TestMocks/User/users';
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

	describe('getByNickname', (): void => {
		let getByFieldMock: SpyInstance;

		const usersMock: User[] = [...users];
		const existingUserNickname: string = 't.stark';
		const notExistingUserNickname: string = 'b.banner';

		beforeEach((): void => {
			getByFieldMock = jest
				.spyOn(usersRepository, 'getByField')
				.mockImplementation(
					async (fieldName: TUserGetFields, fieldValue: string): Promise<User | null> => {
						return (
							usersMock.find((user: User) => {
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
			expect(usersService.getByNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByNickname).toBeInstanceOf(Function);
		});

		it('should use getByField method from users repository for searching user', async (): Promise<void> => {
			await usersService.getByNickname(existingUserNickname);

			expect(getByFieldMock).toHaveBeenCalledTimes(1);
			expect(getByFieldMock).toHaveBeenCalledWith('nickname', existingUserNickname);
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
			const foundedUser: UserShortDto | null =
				await usersService.getByNickname(notExistingUserNickname);

			expect(foundedUser).toBeNull();
		});
	});
});
