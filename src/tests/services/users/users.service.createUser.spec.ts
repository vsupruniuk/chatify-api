import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

import { connectionSource } from '@DB/typeOrmConfig';

import { IUsersService } from '@Interfaces/users/IUsersService';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

import { UsersService } from '@Services/users.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';

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

	describe('createUser', (): void => {
		let getUserByIdMock: SpyInstance;
		let createUserMock: SpyInstance;
		let createDefaultSettingsMock: SpyInstance;
		let createOTPCodeMock: SpyInstance;
		let generateOTPCodeMock: SpyInstance;
		let hashMock: SpyInstance;

		const otpCode: number = 123987;
		const userId: string = '4';
		const userAccountSettingsId: string = '001';
		const userOTPCodeId: string = '10';
		const userHashedPassword: string = 'uuid-hash';
		const user: SignupUserDto = {
			firstName: 'Bruce',
			lastName: 'Banner',
			nickname: 'b.banner',
			email: 'bruce@mail.com',
			password: 'qwerty1A',
			passwordConfirmation: 'qwerty1A',
		};

		beforeEach((): void => {
			jest.useFakeTimers();

			getUserByIdMock = jest.spyOn(usersRepository, 'getById').mockResolvedValue(
				plainToInstance(UserShortDto, <UserShortDto>{
					...user,
					id: userId,
					about: null,
					avatarUrl: null,
					accountSettingsId: userAccountSettingsId,
					OTPCodeId: userOTPCodeId,
				}),
			);

			createUserMock = jest.spyOn(usersRepository, 'createUser').mockResolvedValue(userId);

			createDefaultSettingsMock = jest
				.spyOn(accountSettingsRepository, 'createDefaultSettings')
				.mockResolvedValue(userAccountSettingsId);

			createOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'createOTPCode')
				.mockResolvedValue(userOTPCodeId);

			generateOTPCodeMock = jest.spyOn(OTPCodesHelper, 'generateOTPCode').mockReturnValue(otpCode);

			hashMock = jest.spyOn(bcrypt, 'hash').mockResolvedValue(userHashedPassword as never);
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();
		});

		it('should be defined', async (): Promise<void> => {
			expect(usersService.createUser).toBeDefined();
		});

		it('should create basic account settings for user', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(createDefaultSettingsMock).toHaveBeenCalled();
		});

		it('should create OTP code for user', async (): Promise<void> => {
			const date: string = '2023-11-22 16:30:00';

			jest.setSystemTime(new Date(date));

			await usersService.createUser(user);

			expect(generateOTPCodeMock).toHaveBeenCalled();
			expect(createOTPCodeMock).toHaveBeenCalledWith({
				code: otpCode,
				expiresAt: '2023-11-22 16:40:00',
			});
		});

		it('should hash user password', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(hashMock).toHaveBeenCalledWith(
				user.password,
				Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
			);
		});

		it('should create a new user and return him as response', async (): Promise<void> => {
			const createdUser: UserShortDto = await usersService.createUser(user);

			expect(createUserMock).toHaveBeenCalledWith(<CreateUserDto>{
				...user,
				accountSettingsId: userAccountSettingsId,
				password: userHashedPassword,
				OTPCodeId: userOTPCodeId,
			});
			expect(createdUser.firstName).toEqual(user.firstName);
			expect(createdUser.lastName).toEqual(user.lastName);
			expect(createdUser.nickname).toEqual(user.nickname);
			expect(createdUser.email).toEqual(user.email);
		});

		it('should create create default values for user', async (): Promise<void> => {
			const createdUser: UserShortDto = await usersService.createUser(user);

			expect(createdUser.id.length >= 1).toBe(true);
			expect(createdUser.about).toBeNull();
			expect(createdUser.avatarUrl).toBeNull();
			expect(createdUser.accountSettingsId.length >= 1).toBe(true);
			expect(createdUser.OTPCodeId.length >= 1).toBe(true);
		});

		it('should return created user as instance of UserShortDto', async (): Promise<void> => {
			const createdUser: UserShortDto = await usersService.createUser(user);

			expect(createdUser).toBeInstanceOf(UserShortDto);
		});

		it('should call getById method from users repository to get created user by id', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(getUserByIdMock).toHaveBeenCalledWith(userId);
		});
	});
});
