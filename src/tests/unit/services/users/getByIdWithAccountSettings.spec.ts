import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { User, AccountSettings } from '@entities';

import { users, accountSettings } from '@testMocks';

import { UserWithAccountSettingsDto } from '@dtos/users';

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
		usersRepository = moduleFixture.get(CustomProvider.CTF_USERS_REPOSITORY);
	});

	describe('Get by id with account settings', (): void => {
		const userMock: User = users[0];
		const accountSetting: AccountSettings = accountSettings[0];

		const id: string = userMock.id;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'findByIdWithAccountSettings')
				.mockResolvedValue({ ...userMock, accountSettings: { ...accountSetting } });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find by id with account settings method from users repository to find a user', async (): Promise<void> => {
			await usersService.getByIdWithAccountSettings(id);

			expect(usersRepository.findByIdWithAccountSettings).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByIdWithAccountSettings).toHaveBeenNthCalledWith(1, id);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByIdWithAccountSettings').mockResolvedValue(null);

			const user: UserWithAccountSettingsDto | null =
				await usersService.getByIdWithAccountSettings(id);

			expect(user).toBeNull();
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto | null =
				await usersService.getByIdWithAccountSettings(id);

			expect(user).toEqual(
				plainToInstance(
					UserWithAccountSettingsDto,
					{ ...userMock, accountSettings: { ...accountSetting } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return a user as instance of UserWithAccountSettingsDto', async (): Promise<void> => {
			const user: UserWithAccountSettingsDto | null =
				await usersService.getByIdWithAccountSettings(id);

			expect(user).toBeInstanceOf(UserWithAccountSettingsDto);
		});
	});
});
