import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { AppUserService } from '@services';

import { CustomProviders } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

import { providers } from '@modules/providers';

import { AppUserDto } from '@dtos/appUser';

import { IUsersRepository } from '@repositories';

describe('App user service', (): void => {
	let appUserService: AppUserService;
	let usersRepository: IUsersRepository;

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
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Get app user', (): void => {
		const userMock: User = users[5];
		const userIdMock: string = userMock.id;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findByIdWithAccountSettings').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find by id with account settings method from users repository to find user', async (): Promise<void> => {
			await appUserService.getAppUser(userIdMock);

			expect(usersRepository.findByIdWithAccountSettings).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByIdWithAccountSettings).toHaveBeenNthCalledWith(1, userIdMock);
		});

		it('should throw not found exception if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByIdWithAccountSettings').mockResolvedValue(null);

			await expect(appUserService.getAppUser(userIdMock)).rejects.toThrow(NotFoundException);
		});

		it('should return founded user', async (): Promise<void> => {
			const user: AppUserDto = await appUserService.getAppUser(userIdMock);

			expect(user.id).toBe(userMock.id);
		});

		it('should return response as instance of AppUserDto', async (): Promise<void> => {
			const user: AppUserDto = await appUserService.getAppUser(userIdMock);

			expect(user).toBeInstanceOf(AppUserDto);
		});
	});
});
