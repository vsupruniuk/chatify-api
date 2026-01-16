import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { SearchController } from '@controllers';

import { IUsersService } from '@services';

import { CustomProvider } from '@enums';

import { providers } from '@modules/providers';

import { User } from '@entities';

import { users } from '@testMocks';

import { UserDto } from '@dtos/users';

describe('Search controller', (): void => {
	let searchController: SearchController;
	let usersService: IUsersService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [SearchController],
			providers: [
				JwtService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		searchController = moduleFixture.get(SearchController);
		usersService = moduleFixture.get(CustomProvider.CTF_USERS_SERVICE);
	});

	describe('Find users', (): void => {
		const usersMock: User[] = users.slice(1, 5);

		const nickname: string = 't.stark';
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(usersService, 'getActivatedUsersByNickname').mockResolvedValue(
				usersMock.map((user: User) => {
					return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get activated users by nickname method from users service to find users by nickname', async (): Promise<void> => {
			await searchController.findUsers(nickname, { page, take });

			expect(usersService.getActivatedUsersByNickname).toHaveBeenCalledTimes(1);
			expect(usersService.getActivatedUsersByNickname).toHaveBeenNthCalledWith(
				1,
				nickname,
				page,
				take,
			);
		});

		it('should return empty array if no users were found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getActivatedUsersByNickname').mockResolvedValue([]);

			const users: UserDto[] = await searchController.findUsers(nickname, { page, take });

			expect(users).toHaveLength(0);
		});

		it('should return all found users', async (): Promise<void> => {
			const users: UserDto[] = await searchController.findUsers(nickname, { page, take });

			expect(users.sort()).toEqual(
				usersMock
					.map((user: User) =>
						plainToInstance(UserDto, user, {
							excludeExtraneousValues: true,
						}),
					)
					.sort(),
			);
		});

		it('should return all found users as array of UserDto', async (): Promise<void> => {
			const users: UserDto[] = await searchController.findUsers(nickname, { page, take });

			expect(users).toBeInstanceOf(Array);

			users.forEach((user: UserDto) => {
				expect(user).toBeInstanceOf(UserDto);
			});
		});
	});
});
