import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { IUsersRepository } from '@repositories';

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

	describe('Get by email or nickname', (): void => {
		const userMock: User = users[1];

		const email: string = userMock.email;
		const nickname: string = userMock.nickname;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findByEmailOrNickname').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find by email or nickname from users repository to find a user', async (): Promise<void> => {
			await usersService.getByEmailOrNickname(email, nickname);

			expect(usersRepository.findByEmailOrNickname).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByEmailOrNickname).toHaveBeenNthCalledWith(1, email, nickname);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByEmailOrNickname').mockResolvedValue(null);

			const user: UserDto | null = await usersService.getByEmailOrNickname(email, nickname);

			expect(user).toBeNull();
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getByEmailOrNickname(email, nickname);

			expect(user).toEqual(plainToInstance(UserDto, user, { excludeExtraneousValues: true }));
		});

		it('should return response as an instance of UserDto', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getByEmailOrNickname(email, nickname);

			expect(user).toBeInstanceOf(UserDto);
		});
	});
});
