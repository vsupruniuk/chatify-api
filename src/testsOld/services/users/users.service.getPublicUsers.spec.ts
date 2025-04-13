import { IUsersService } from '@services/users/IUsersService';
import SpyInstance = jest.SpyInstance;
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@repositories/otpCodes/IOTPCodesRepository';
import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { UsersRepository } from '@repositories/users/users.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { OTPCodesRepository } from '@repositories/otpCodes/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { UsersService } from '@services/users/users.service';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { UserPublicDto } from '../../../types/dto/users/UserPublic.dto';

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

	describe('getPublicUsers', (): void => {
		let getPublicUsersMock: SpyInstance;

		const usersMock: User[] = [...users];
		const userNickname: string = 's.rogers';

		beforeEach((): void => {
			getPublicUsersMock = jest
				.spyOn(usersRepository, 'getPublicUsers')
				.mockImplementation(
					async (nickname: string, skip: number, take: number): Promise<User[]> => {
						return usersMock
							.filter((user: User) => {
								return (
									user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated
								);
							})
							.slice(skip, take);
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersService.getPublicUsers).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getPublicUsers).toBeInstanceOf(Function);
		});

		it('should use getPublicUsers method from users repository to get activated users by nickname', async (): Promise<void> => {
			const nickname: string = 't.stark';
			const page: number = 1;
			const take: number = 10;

			await usersService.getPublicUsers(userNickname, nickname, page, take);

			expect(getPublicUsersMock).toHaveBeenCalledTimes(1);
			expect(getPublicUsersMock).toHaveBeenCalledWith(nickname, page * take - take, take);
		});

		it('should provide default values for getPublicUsers method if page or take not provided', async (): Promise<void> => {
			const nickname: string = 't.stark';

			await usersService.getPublicUsers(userNickname, nickname);

			expect(getPublicUsersMock).toHaveBeenCalledTimes(1);
			expect(getPublicUsersMock).toHaveBeenCalledWith(nickname, 0, 10);
		});

		it('should return response as instance of Array', async (): Promise<void> => {
			const nickname: string = 't.stark';

			const users: UserPublicDto[] = await usersService.getPublicUsers(userNickname, nickname);

			expect(users).toBeInstanceOf(Array);
		});

		it('should return each user as instance of UserPublicDto', async (): Promise<void> => {
			const nickname: string = 'ro';

			const users: UserPublicDto[] = await usersService.getPublicUsers(userNickname, nickname);

			users.forEach((user: UserPublicDto) => {
				expect(user).toBeInstanceOf(UserPublicDto);
			});
		});

		it('should exclude current logged-in user from the result', async (): Promise<void> => {
			const nickname: string = 'ro';

			const users: UserPublicDto[] = await usersService.getPublicUsers(userNickname, nickname);

			users.forEach((user: UserPublicDto) => {
				expect(user.nickname).not.toBe(userNickname);
			});
		});

		it('should return empty array if no users found', async (): Promise<void> => {
			const nickname: string = 't.stark';

			const users: UserPublicDto[] = await usersService.getPublicUsers(userNickname, nickname);

			expect(users).toStrictEqual([]);
		});
	});
});
