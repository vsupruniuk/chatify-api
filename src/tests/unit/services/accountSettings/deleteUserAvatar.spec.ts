import { AccountSettingsService } from '@services/accountSettings/accountSettings.service';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { UsersService } from '@services/users/users.service';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { FileHelper } from '@helpers/file.helper';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('Account settings service', (): void => {
	let accountSettingsService: AccountSettingsService;
	let usersService: UsersService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AccountSettingsService,

				providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,
				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		accountSettingsService = moduleFixture.get(AccountSettingsService);
		usersService = moduleFixture.get(CustomProviders.CTF_USERS_SERVICE);
	});

	describe('Delete user avatar', (): void => {
		const userMock: User = users[2];
		const userIdMock: string = userMock.id;

		beforeEach((): void => {
			jest.spyOn(usersService, 'getById').mockResolvedValue(userMock);
			jest.spyOn(usersService, 'updateUserAvatarUrl').mockImplementation(jest.fn());
			jest.spyOn(FileHelper, 'deleteFile').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(accountSettingsService.deleteUserAvatar).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(accountSettingsService.deleteUserAvatar).toBeInstanceOf(Function);
		});

		it('should call get by id method from user service to find a user by provided id', async (): Promise<void> => {
			await accountSettingsService.deleteUserAvatar(userIdMock);

			expect(usersService.getById).toHaveBeenCalledTimes(1);
			expect(usersService.getById).toHaveBeenNthCalledWith(1, userIdMock);
		});

		it('should call delete file method file helper to delete user avatar', async (): Promise<void> => {
			await accountSettingsService.deleteUserAvatar(userIdMock);

			expect(FileHelper.deleteFile).toHaveBeenCalledTimes(1);
			expect(FileHelper.deleteFile).toHaveBeenNthCalledWith(1, userMock.avatarUrl);
		});

		it('should call update user avatar url method from users service to set user avatar url to null', async (): Promise<void> => {
			await accountSettingsService.deleteUserAvatar(userIdMock);

			expect(usersService.updateUserAvatarUrl).toHaveBeenCalledTimes(1);
			expect(usersService.updateUserAvatarUrl).toHaveBeenNthCalledWith(1, userIdMock, null);
		});

		it('should throw unauthorized exception if user service failed to find user by id', async (): Promise<void> => {
			jest.spyOn(usersService, 'getById').mockResolvedValue(null);

			await expect(accountSettingsService.deleteUserAvatar(userIdMock)).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('should throw bad request exception if user does not have an saved avatar', async (): Promise<void> => {
			jest.spyOn(usersService, 'getById').mockResolvedValue({ ...userMock, avatarUrl: null });

			await expect(accountSettingsService.deleteUserAvatar(userIdMock)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await accountSettingsService.deleteUserAvatar(userIdMock);

			expect(result).toBeUndefined();
		});
	});
});
