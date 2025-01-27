import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { UsersRepository } from '@Repositories/users.repository';
import { connectionSource } from '@DB/typeOrmConfig';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { UsersService } from '@Services/users.service';
import { User } from '@Entities/User.entity';
import { users } from '@TestMocks/User/users';
import SpyInstance = jest.SpyInstance;
import { UserShortDto } from '@DTO/users/UserShort.dto';

describe('usersService', (): void => {
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;
	let accountSettingsRepository: IAccountSettingsRepository;
	let otpCodesRepository: IOTPCodesRepository;
	let passwordResetTokensRepository: IPasswordResetTokensRepository;

	beforeAll((): void => {
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

	describe('getByEmailOrNickname', (): void => {
		let getByEmailOrNicknameMock: SpyInstance;

		const usersMock: User[] = [...users];
		const existingUserEmail: string = usersMock[2].email;
		const existingUserNickname: string = usersMock[3].nickname;
		const nonExistingUserEmail: string = 'tanos@avengers.com';
		const nonExistingUserNickname: string = 'tanos';

		beforeEach((): void => {
			getByEmailOrNicknameMock = jest
				.spyOn(usersRepository, 'getByEmailOrNickname')
				.mockImplementation(async (email: string, nickname: string): Promise<User | null> => {
					return (
						usersMock.find((user: User) => user.email === email || user.nickname === nickname) ||
						null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersService.getByEmailOrNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByEmailOrNickname).toBeInstanceOf(Function);
		});

		it('should use getByEmailOrNickname in users repository to find user', async (): Promise<void> => {
			await usersService.getByEmailOrNickname(existingUserEmail, existingUserNickname);

			expect(getByEmailOrNicknameMock).toHaveBeenCalledTimes(1);
			expect(getByEmailOrNicknameMock).toHaveBeenNthCalledWith(
				1,
				existingUserEmail,
				existingUserNickname,
			);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const user: UserShortDto | null = await usersService.getByEmailOrNickname(
				existingUserEmail,
				existingUserNickname,
			);

			expect(user).toBeInstanceOf(UserShortDto);
		});

		it('should return founded user if user with provided email already exists', async (): Promise<void> => {
			const user: UserShortDto | null = await usersService.getByEmailOrNickname(
				existingUserEmail,
				nonExistingUserNickname,
			);

			expect(user?.email).toBe(existingUserEmail);
		});

		it('should return founded user if user with provided nickname already exists', async (): Promise<void> => {
			const user: UserShortDto | null = await usersService.getByEmailOrNickname(
				nonExistingUserEmail,
				existingUserNickname,
			);

			expect(user?.nickname).toBe(existingUserNickname);
		});

		it('should return null if user with provided email and nickname does not exist', async (): Promise<void> => {
			const user: UserShortDto | null = await usersService.getByEmailOrNickname(
				nonExistingUserEmail,
				nonExistingUserNickname,
			);

			expect(user).toBeNull();
		});
	});
});
