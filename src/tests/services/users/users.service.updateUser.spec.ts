import SpyInstance = jest.SpyInstance;
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { IUsersService } from '@services/users/IUsersService';
import { IAccountSettingsRepository } from '@repositories/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@repositories/otpCode/IOTPCodesRepository';
import { IPasswordResetTokensRepository } from '@repositories/passwordResetToken/IPasswordResetTokensRepository';
import { UsersRepository } from '@repositories/users/users.repository';
import { connectionSource } from '@db/typeOrmConfig';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { OTPCodesRepository } from '@repositories/otpCode/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { UsersService } from '@services/users/users.service';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { UpdateUserDto } from '../../../types/dto/users/UpdateUser.dto';
import * as bcrypt from 'bcrypt';

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

	describe('updateUser', (): void => {
		let updateUserMock: SpyInstance;
		let hashMock: SpyInstance;

		const usersMock: User[] = [...users];
		const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
		const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b44442';
		const userHashedPassword: string = 'uuid-hash';
		const updateUserDto: Partial<UpdateUserDto> = {
			firstName: 'Bruce',
			lastName: 'Banner',
		};

		beforeEach((): void => {
			updateUserMock = jest
				.spyOn(usersRepository, 'updateUser')
				.mockImplementation(async (userId: string): Promise<boolean> => {
					return usersMock.some((user: User) => user.id === userId);
				});

			hashMock = jest.spyOn(bcrypt, 'hash').mockResolvedValue(userHashedPassword as never);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.updateUser).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.updateUser).toBeInstanceOf(Function);
		});

		it('should call updateUser method in users repository to update user', async (): Promise<void> => {
			await usersService.updateUser(existingUserId, updateUserDto);

			expect(updateUserMock).toHaveBeenCalledTimes(1);
			expect(updateUserMock).toHaveBeenCalledWith(existingUserId, updateUserDto);
		});

		it('should call hash method in bcrypt if password was passed in dto', async (): Promise<void> => {
			const updateUserDtoWithPassword: Partial<UpdateUserDto> = {
				firstName: 'Bruce',
				lastName: 'Banner',
				password: 'qwerty123QWERTY',
			};

			await usersService.updateUser(existingUserId, updateUserDtoWithPassword);

			expect(hashMock).toHaveBeenCalledTimes(1);
			expect(hashMock).toHaveBeenCalledWith(
				updateUserDtoWithPassword.password,
				Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
			);
		});

		it('should not call hash method in bcrypt if password was not passed in dto', async (): Promise<void> => {
			await usersService.updateUser(existingUserId, updateUserDto);

			expect(hashMock).not.toHaveBeenCalled();
		});

		it('should return false if user with given id not exist', async (): Promise<void> => {
			const result: boolean = await usersService.updateUser(notExistingUserId, updateUserDto);

			expect(result).toBe(false);
		});

		it('should return true if user with given id exist', async (): Promise<void> => {
			const result: boolean = await usersService.updateUser(existingUserId, updateUserDto);

			expect(result).toBe(true);
		});
	});
});
