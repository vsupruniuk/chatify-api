import { IUsersService } from '@Interfaces/users/IUsersService';
import { UsersService } from '@Services/users.service';
import { StatusesRepository } from '@Repositories/statuses.repository';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { IStatusesRepository } from '@Interfaces/statuses/IStatusesRepository';
import { IAccountSettingsRepository } from '@Interfaces/accountSettings/IAccountSettingsRepository';
import * as bcrypt from 'bcrypt';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { connectionSource } from '@DB/typeOrmConfig';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { plainToClass } from 'class-transformer';
import SpyInstance = jest.SpyInstance;
import * as process from 'process';
import { CreateUserDto } from '@DTO/users/CreateUser.dto';

// TODO add test cases for calling email service
// TODO add test cases for generating OTP code

describe('Users service', (): void => {
	let usersService: IUsersService;
	let usersRepository: IUsersRepository;
	let statusesRepository: IStatusesRepository;
	let accountSettingsRepository: IAccountSettingsRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
		statusesRepository = new StatusesRepository(connectionSource);
		accountSettingsRepository = new AccountSettingsRepository(connectionSource);

		usersService = new UsersService(accountSettingsRepository, statusesRepository, usersRepository);
	});

	describe('createUser', (): void => {
		let getUserByIdMock: SpyInstance;
		let createUserMock: SpyInstance;
		let createStatusMock: SpyInstance;
		let createDefaultSettingsMock: SpyInstance;
		let hashMock: SpyInstance;

		const userId: string = '4';
		const userStatusId: string = '01';
		const userAccountSettingsId: string = '001';
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
				plainToClass(UserShortDto, <UserShortDto>{
					...user,
					id: userId,
					about: null,
					avatarUrl: null,
					accountSettingsId: userStatusId,
					OTPCodeId: null,
				}),
			);

			createUserMock = jest.spyOn(usersRepository, 'createUser').mockResolvedValue(userId);

			createStatusMock = jest
				.spyOn(statusesRepository, 'createStatus')
				.mockResolvedValue(userStatusId);

			createDefaultSettingsMock = jest
				.spyOn(accountSettingsRepository, 'createDefaultSettings')
				.mockResolvedValue(userAccountSettingsId);

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

		it('should create status entity for user', async (): Promise<void> => {
			const date: string = '2023-11-18 12:00:00';

			jest.setSystemTime(new Date(date));

			await usersService.createUser(user);

			expect(createStatusMock).toHaveBeenCalledWith({
				statusText: '',
				dateTime: date,
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
				statusId: userStatusId,
			});
			expect(createdUser.firstName).toEqual(user.firstName);
			expect(createdUser.lastName).toEqual(user.lastName);
			expect(createdUser.nickname).toEqual(user.nickname);
			expect(createdUser.email).toEqual(user.email);
		});

		it('should create create default values for user', async (): Promise<void> => {
			const createdUser: UserShortDto = await usersService.createUser(user);

			expect(createdUser.id.length >= 1).toBeTruthy();
			expect(createdUser.about).toBeNull();
			expect(createdUser.avatarUrl).toBeNull();
			expect(createdUser.accountSettingsId.length >= 1).toBeTruthy();
			expect(createdUser.OTPCodeId).toBeNull();
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
