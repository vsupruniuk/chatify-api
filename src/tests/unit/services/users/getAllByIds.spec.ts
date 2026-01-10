import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

import { UserDto } from '@dtos/users';

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

	describe('Get all by ids', (): void => {
		const usersMock: User[] = users.slice(1, 4);

		const ids: string[] = usersMock.map((user: User) => user.id);

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findAllByIds').mockResolvedValue(usersMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find all by ids method form users repository to get all users', async (): Promise<void> => {
			await usersService.getAllByIds(ids);

			expect(usersRepository.findAllByIds).toHaveBeenCalledTimes(1);
			expect(usersRepository.findAllByIds).toHaveBeenNthCalledWith(1, ids);
		});

		it('should return all found users', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getAllByIds(ids);

			expect(users).toHaveLength(usersMock.length);
			expect(users).toEqual(
				usersMock.map((user: User) =>
					plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
				),
			);
		});

		it('should return users as array of UserDto', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getAllByIds(ids);

			expect(users).toBeInstanceOf(Array);

			users.forEach((user: UserDto) => {
				expect(user).toBeInstanceOf(UserDto);
			});
		});

		it('should return empty array if no users were found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findAllByIds').mockResolvedValue([]);

			const users: UserDto[] = await usersService.getAllByIds(ids);

			expect(users).toHaveLength(0);
		});
	});
});
