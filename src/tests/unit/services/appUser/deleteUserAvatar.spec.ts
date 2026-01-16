import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

import { FileHelper } from '@helpers';

import { IUsersService, AppUserService } from '@services';

import { UserDto } from '@dtos/users';

describe('App user service', (): void => {
	let appUserService: AppUserService;
	let usersService: IUsersService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AppUserService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		appUserService = moduleFixture.get(AppUserService);
		usersService = moduleFixture.get(CustomProvider.CTF_USERS_SERVICE);
	});

	describe('Delete user avatar', (): void => {
		const userMock: User = users[2];
		const userIdMock: string = userMock.id;

		beforeEach((): void => {
			jest
				.spyOn(usersService, 'getById')
				.mockResolvedValue(plainToInstance(UserDto, userMock, { excludeExtraneousValues: true }));
			jest.spyOn(usersService, 'updateUserAvatarUrl').mockImplementation(jest.fn());
			jest.spyOn(FileHelper, 'deleteFile').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by id method from user service to find a user by provided id', async (): Promise<void> => {
			await appUserService.deleteUserAvatar(userIdMock);

			expect(usersService.getById).toHaveBeenCalledTimes(1);
			expect(usersService.getById).toHaveBeenNthCalledWith(1, userIdMock);
		});

		it('should call delete file method file helper to delete user avatar', async (): Promise<void> => {
			await appUserService.deleteUserAvatar(userIdMock);

			expect(FileHelper.deleteFile).toHaveBeenCalledTimes(1);
			expect(FileHelper.deleteFile).toHaveBeenNthCalledWith(1, userMock.avatarUrl);
		});

		it('should call update user avatar url method from users service to set user avatar url to null', async (): Promise<void> => {
			await appUserService.deleteUserAvatar(userIdMock);

			expect(usersService.updateUserAvatarUrl).toHaveBeenCalledTimes(1);
			expect(usersService.updateUserAvatarUrl).toHaveBeenNthCalledWith(1, userIdMock, null);
		});

		it('should throw unauthorized exception if user service failed to find user by id', async (): Promise<void> => {
			jest.spyOn(usersService, 'getById').mockResolvedValue(null);

			await expect(appUserService.deleteUserAvatar(userIdMock)).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('should throw bad request exception if user does not have an saved avatar', async (): Promise<void> => {
			jest.spyOn(usersService, 'getById').mockResolvedValue({ ...userMock, avatarUrl: null });

			await expect(appUserService.deleteUserAvatar(userIdMock)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await appUserService.deleteUserAvatar(userIdMock);

			expect(result).toBeUndefined();
		});
	});
});
