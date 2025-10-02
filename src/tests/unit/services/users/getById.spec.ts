import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { providers } from '@modules/providers';

import { IUsersRepository } from '@repositories';

import { CustomProviders } from '@enums';

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
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Get by id', (): void => {
		const userMock: User = users[0];

		const id: string = userMock.id;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findById').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getById).toBeInstanceOf(Function);
		});

		it('should call find by id method from users repository to find a user', async (): Promise<void> => {
			await usersService.getById(id);

			expect(usersRepository.findById).toHaveBeenCalledTimes(1);
			expect(usersRepository.findById).toHaveBeenNthCalledWith(1, id);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findById').mockResolvedValue(null);

			const user: UserDto | null = await usersService.getById(id);

			expect(user).toBeNull();
		});

		it('should return founded user', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getById(id);

			expect(user).toEqual(plainToInstance(UserDto, userMock, { excludeExtraneousValues: true }));
		});

		it('should return founded user as instance of UserDto', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getById(id);

			expect(user).toBeInstanceOf(UserDto);
		});
	});
});
