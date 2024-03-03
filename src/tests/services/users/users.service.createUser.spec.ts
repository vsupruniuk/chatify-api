import { AccountSettings } from '@Entities/AccountSettings.entity';
import { OTPCode } from '@Entities/OTPCode.entity';
import { User } from '@Entities/User.entity';
import { IPasswordResetTokensRepository } from '@Interfaces/passwordResetTokens/IPasswordResetTokensRepository';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { accountSettings } from '@TestMocks/AccountSettings/accountSettings';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
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

	describe('createUser', (): void => {
		let getUserByFieldMock: SpyInstance;
		let createUserMock: SpyInstance;
		let createDefaultSettingsMock: SpyInstance;
		let getAccountSettingsMock: SpyInstance;
		let createOTPCodeMock: SpyInstance;
		let getOTPCodeMock: SpyInstance;
		let generateOTPCodeMock: SpyInstance;
		let hashMock: SpyInstance;

		const accountSettingsMock: AccountSettings[] = [...accountSettings];
		const otpCodesMock: OTPCode[] = [...otpCodes];
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

			getUserByFieldMock = jest.spyOn(usersRepository, 'getByField').mockResolvedValue(
				plainToInstance(User, {
					...user,
					id: userId,
					about: null,
					avatarUrl: null,
					accountSettings: { id: userAccountSettingsId },
					OTPCode: { id: userOTPCodeId },
				}),
			);

			createUserMock = jest.spyOn(usersRepository, 'createUser').mockResolvedValue(userId);

			createDefaultSettingsMock = jest
				.spyOn(accountSettingsRepository, 'createDefaultSettings')
				.mockResolvedValue(userAccountSettingsId);

			getAccountSettingsMock = jest
				.spyOn(accountSettingsRepository, 'getById')
				.mockImplementation(async (id: string): Promise<AccountSettings | null> => {
					return (
						accountSettingsMock.find((settings: AccountSettings) => settings.id === id) || null
					);
				});

			createOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'createOTPCode')
				.mockResolvedValue(userOTPCodeId);

			getOTPCodeMock = jest
				.spyOn(otpCodesRepository, 'getUserOTPCodeById')
				.mockImplementation(async (userOTPCodeId: string): Promise<OTPCode | null> => {
					const otpCode: OTPCode | undefined = otpCodesMock.find(
						(otpCode: OTPCode) => otpCode.id === userOTPCodeId,
					);

					return otpCode
						? plainToInstance(OTPCode, otpCode, { excludeExtraneousValues: true })
						: null;
				});

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

		it('should be a function', (): void => {
			expect(usersService.createUser).toBeInstanceOf(Function);
		});

		it('should create basic account settings for user', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(createDefaultSettingsMock).toHaveBeenCalledTimes(1);
		});

		it('should create OTP code for user', async (): Promise<void> => {
			const date: string = '2023-11-22 16:30:00';

			jest.setSystemTime(new Date(date));

			await usersService.createUser(user);

			expect(generateOTPCodeMock).toHaveBeenCalledTimes(1);
			expect(createOTPCodeMock).toHaveBeenCalledWith({
				code: otpCode,
				expiresAt: new Date('2023-11-22 16:40:00').toISOString(),
			});
		});

		it('should hash user password', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(hashMock).toHaveBeenCalledTimes(1);
			expect(hashMock).toHaveBeenCalledWith(
				user.password,
				Number(process.env.PASSWORD_SALT_HASH_ROUNDS),
			);
		});

		it('should call getById method in account settings repository to get user account settings', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(getAccountSettingsMock).toHaveBeenCalledTimes(1);
			expect(getAccountSettingsMock).toHaveBeenCalledWith(userAccountSettingsId);
		});

		it('should call getUserOTPCodeById method in OTP codes repository to get user OTP code', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(getOTPCodeMock).toHaveBeenCalledTimes(1);
			expect(getOTPCodeMock).toHaveBeenCalledWith(userOTPCodeId);
		});

		it('should create a new user and return him as response', async (): Promise<void> => {
			const createdUser: UserShortDto | null = await usersService.createUser(user);

			expect(createUserMock).toHaveBeenCalledTimes(1);
			expect(createUserMock).toHaveBeenCalledWith(<CreateUserDto>{
				...user,
				accountSettings: await accountSettingsRepository.getById(userAccountSettingsId),
				OTPCode: await otpCodesRepository.getUserOTPCodeById(userOTPCodeId),
				password: userHashedPassword,
			});

			expect(createdUser?.firstName).toEqual(user.firstName);
			expect(createdUser?.lastName).toEqual(user.lastName);
			expect(createdUser?.nickname).toEqual(user.nickname);
			expect(createdUser?.email).toEqual(user.email);
		});

		it('should create create default values for user', async (): Promise<void> => {
			const createdUser: UserShortDto | null = await usersService.createUser(user);

			expect((createdUser?.id || '').length >= 1).toBe(true);
			expect(createdUser?.about).toBeNull();
			expect(createdUser?.avatarUrl).toBeNull();
			expect(createdUser?.accountSettings.id).toBe(userAccountSettingsId);
			expect(createdUser?.OTPCode.id).toBe(userOTPCodeId);
		});

		it('should return created user as instance of UserShortDto', async (): Promise<void> => {
			const createdUser: UserShortDto | null = await usersService.createUser(user);

			expect(createdUser).toBeInstanceOf(UserShortDto);
		});

		it('should call getByField method from users repository to get created user by id', async (): Promise<void> => {
			await usersService.createUser(user);

			expect(getUserByFieldMock).toHaveBeenCalledTimes(1);
			expect(getUserByFieldMock).toHaveBeenCalledWith('id', userId);
		});
	});
});
