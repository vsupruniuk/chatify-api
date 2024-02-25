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

	describe('getFullUserById', (): void => {
		let getFullUserByFieldMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b31111';

		beforeEach((): void => {
			getFullUserByFieldMock = jest
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
			expect(usersService.getFullUserById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getFullUserById).toBeInstanceOf(Function);
		});

		it('should use getFullUserByField method from users repository for searching user', async (): Promise<void> => {
			await usersService.getFullUserById(existingUserId);

			expect(getFullUserByFieldMock).toHaveBeenCalledTimes(1);
			expect(getFullUserByFieldMock).toHaveBeenCalledWith('id', existingUserId);
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersService.getFullUserById(existingUserId);

			expect(foundedUser?.id).toEqual(existingUserId);
		});

		it('should return founded user as instance of UserFullDto', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersService.getFullUserById(existingUserId);

			expect(foundedUser).toBeInstanceOf(UserFullDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser: UserFullDto | null = await usersService.getFullUserById(notExistingUserId);

			expect(foundedUser).toBeNull();
		});
	});
});
