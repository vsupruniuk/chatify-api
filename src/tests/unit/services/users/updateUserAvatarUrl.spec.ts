import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

describe('Users service', (): void => {
	let usersService: UsersService;
	let usersRepository: IUsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,

				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		usersService = moduleFixture.get(UsersService);
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Update user avatar url', (): void => {
		const userMock: User = users[2];

		const userId: string = userMock.id;
		const avatarUrl: string = userMock.avatarUrl as string;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'updateUserAvatarUrl').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should call update user avatar url method from users repository with avatar url', async (): Promise<void> => {
			await usersService.updateUserAvatarUrl(userId, avatarUrl);

			expect(usersRepository.updateUserAvatarUrl).toHaveBeenCalledTimes(1);
			expect(usersRepository.updateUserAvatarUrl).toHaveBeenNthCalledWith(1, userId, avatarUrl);
		});

		it('should call update user avatar url method from users repository with null', async (): Promise<void> => {
			await usersService.updateUserAvatarUrl(userId, null);

			expect(usersRepository.updateUserAvatarUrl).toHaveBeenCalledTimes(1);
			expect(usersRepository.updateUserAvatarUrl).toHaveBeenNthCalledWith(1, userId, null);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await usersService.updateUserAvatarUrl(userId, null);

			expect(result).toBeUndefined();
		});
	});
});
