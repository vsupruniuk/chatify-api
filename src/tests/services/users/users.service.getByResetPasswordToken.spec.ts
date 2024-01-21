import { connectionSource } from '@DB/typeOrmConfig';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { UsersService } from '@Services/users.service';
import { users } from '@TestMocks/UserFullDto/users';
import SpyInstance = jest.SpyInstance;

describe('UsersService', (): void => {
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

	describe('getByResetPasswordToken', (): void => {
		let getByResetPasswordTokenMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserToken: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingUserToken: string = '1662043c-4d4b-4424-ac31-45189dedd090';

		beforeEach((): void => {
			getByResetPasswordTokenMock = jest
				.spyOn(usersRepository, 'getByResetPasswordToken')
				.mockImplementation(async (token: string): Promise<UserFullDto | null> => {
					return usersMock.find((user: UserFullDto) => user.passwordResetToken === token) || null;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getByResetPasswordToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByResetPasswordToken).toBeInstanceOf(Function);
		});

		it('should call getByResetPasswordToken method in users repository to find user by its reset token', async (): Promise<void> => {
			await usersService.getByResetPasswordToken(existingUserToken);

			expect(getByResetPasswordTokenMock).toHaveBeenCalledWith(existingUserToken);
		});

		it('should return null if user not exist', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersService.getByResetPasswordToken(notExistingUserToken);

			expect(user).toBeNull();
		});

		it('should return user if it exist', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersService.getByResetPasswordToken(existingUserToken);

			expect(user?.passwordResetToken).toBe(existingUserToken);
		});

		it('should return user as instance of UserFullDto', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersService.getByResetPasswordToken(existingUserToken);

			expect(user).toBeInstanceOf(UserFullDto);
		});
	});
});
