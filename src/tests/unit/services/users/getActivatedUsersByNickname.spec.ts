import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

import { PaginationHelper } from '@helpers';

import { UserDto } from '@dtos/users';

describe('Users service', () => {
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

	describe('Get activated users by nickname', (): void => {
		const usersMock: User[] = users.slice(2, 5);

		const nickname: string = usersMock[0].nickname;
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findUsersByNicknameAndActive').mockResolvedValue(usersMock);
			jest.spyOn(PaginationHelper, 'toSqlPagination').mockReturnValue({ skip: page, take: take });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call to sql pagination method from pagination helper to transform page and take to correct sql pagination', async (): Promise<void> => {
			await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(PaginationHelper.toSqlPagination).toHaveBeenCalledTimes(1);
			expect(PaginationHelper.toSqlPagination).toHaveBeenNthCalledWith(1, page, take);
		});

		it('should call find activated users by nickname from users repository if page and take parameters provided', async (): Promise<void> => {
			await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(usersRepository.findUsersByNicknameAndActive).toHaveBeenCalledTimes(1);
			expect(usersRepository.findUsersByNicknameAndActive).toHaveBeenNthCalledWith(
				1,
				nickname,
				page,
				take,
			);
		});

		it('should return all found users', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(users).toHaveLength(usersMock.length);
			expect(users.sort()).toEqual(
				usersMock
					.map((user: User) => plainToInstance(UserDto, user, { excludeExtraneousValues: true }))
					.sort(),
			);
		});

		it('should return users as array of UserDto', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(users).toBeInstanceOf(Array);

			users.every((user: UserDto) => {
				expect(user).toBeInstanceOf(UserDto);
			});
		});

		it('should return empty array if no users found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findUsersByNicknameAndActive').mockResolvedValue([]);

			const users: UserDto[] = await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(users).toHaveLength(0);
		});
	});
});
