import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AppUserService, IUsersService } from '@services';

import { CustomProvider } from '@enums';

import { accountSettings, users } from '@testMocks';

import { providers } from '@modules/providers';

import { UserWithAccountSettingsDto } from '@dtos/users';

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

	describe('Get app user', (): void => {
		const userMock: UserWithAccountSettingsDto = plainToInstance(
			UserWithAccountSettingsDto,
			{ ...users[5], accountSettings: { ...accountSettings[5] } },
			{ excludeExtraneousValues: true },
		);

		const userIdMock: string = userMock.id;

		beforeEach((): void => {
			jest.spyOn(usersService, 'getByIdWithAccountSettings').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by id with account settings method from users service to find user', async (): Promise<void> => {
			await appUserService.getAppUser(userIdMock);

			expect(usersService.getByIdWithAccountSettings).toHaveBeenCalledTimes(1);
			expect(usersService.getByIdWithAccountSettings).toHaveBeenNthCalledWith(1, userIdMock);
		});

		it('should throw not found exception if user was not found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByIdWithAccountSettings').mockResolvedValue(null);

			await expect(appUserService.getAppUser(userIdMock)).rejects.toThrow(NotFoundException);
		});

		it('should return founded user', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto = await appUserService.getAppUser(userIdMock);

			expect(user).toEqual(userMock);
		});

		it('should return response as instance of UserWithAccountSettingsDto', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto = await appUserService.getAppUser(userIdMock);

			expect(user).toBeInstanceOf(UserWithAccountSettingsDto);
		});
	});
});
