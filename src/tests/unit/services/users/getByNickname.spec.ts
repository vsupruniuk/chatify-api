import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { providers } from '@modules/providers';

import { IUsersRepository } from '@repositories';

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

	describe('Get by nickname', (): void => {
		const userMock: User = users[1];

		const nickname: string = userMock.nickname;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findByNickname').mockResolvedValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find by nickname method from users repository to find a user', async (): Promise<void> => {
			await usersService.getByNickname(nickname);

			expect(usersRepository.findByNickname).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByNickname).toHaveBeenNthCalledWith(1, nickname);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByNickname').mockResolvedValue(null);

			const user: UserDto | null = await usersService.getByNickname(nickname);

			expect(user).toBeNull();
		});

		it('should return found user', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getByNickname(nickname);

			expect(user).toEqual(plainToInstance(UserDto, userMock, { excludeExtraneousValues: true }));
		});

		it('should return found user as instance of UserDto', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getByNickname(nickname);

			expect(user).toBeInstanceOf(UserDto);
		});
	});
});
