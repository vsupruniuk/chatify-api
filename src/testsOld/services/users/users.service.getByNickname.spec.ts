import SpyInstance = jest.SpyInstance;
import { IOTPCodesRepository } from '@repositories/otpCodes/IOTPCodesRepository';
import { IUsersService } from '@services/users/IUsersService';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { UsersRepository } from '@repositories/users/users.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { UsersService } from '@services/users/users.service';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { TUserGetFields } from '@customTypes/types/users/TUserGetFields';
import { UserShortDto } from '../../../types/dto/users/UserShort.dto';

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
