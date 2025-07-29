import { UsersService } from '@services/users/users.service';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { PaginationHelper } from '@helpers/pagination.helper';
import { UserDto } from '@dtos/users/UserDto';
import { plainToInstance } from 'class-transformer';

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
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Get activated users by nickname', (): void => {
		const usersMock: User[] = users.slice(2, 5);

		const nickname: string = usersMock[0].nickname;
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findActivatedUsersByNickname').mockResolvedValue(usersMock);
			jest.spyOn(PaginationHelper, 'toSQLPagination').mockReturnValue({ skip: page, take: take });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should call to sql pagination method from pagination helper to transform page and take to correct sql pagination', async (): Promise<void> => {
			await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(PaginationHelper.toSQLPagination).toHaveBeenCalledTimes(1);
			expect(PaginationHelper.toSQLPagination).toHaveBeenNthCalledWith(1, page, take);
		});

		it('should call find activated users by nickname from users repository if page and take parameters provided', async (): Promise<void> => {
			await usersService.getActivatedUsersByNickname(nickname, page, take);

			expect(usersRepository.findActivatedUsersByNickname).toHaveBeenCalledTimes(1);
			expect(usersRepository.findActivatedUsersByNickname).toHaveBeenNthCalledWith(
				1,
				nickname,
				page,
				take,
			);
		});

		it('should call find activated users by nickname from users repository if page and take parameters not provided', async (): Promise<void> => {
			await usersService.getActivatedUsersByNickname(nickname);

			expect(usersRepository.findActivatedUsersByNickname).toHaveBeenCalledTimes(1);
			expect(usersRepository.findActivatedUsersByNickname).toHaveBeenNthCalledWith(
				1,
				nickname,
				page,
				take,
			);
		});

		it('should return all found users', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getActivatedUsersByNickname(nickname);

			expect(users.sort()).toEqual(
				usersMock
					.map((user: User) => plainToInstance(UserDto, user, { excludeExtraneousValues: true }))
					.sort(),
			);
		});

		it('should return users as array of UserDto', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getActivatedUsersByNickname(nickname);

			expect(users).toBeInstanceOf(Array);

			users.every((user: UserDto) => {
				expect(user).toBeInstanceOf(UserDto);
			});
		});

		it('should return empty array if no users found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findActivatedUsersByNickname').mockResolvedValue([]);

			const users: UserDto[] = await usersService.getActivatedUsersByNickname(nickname);

			expect(users).toHaveLength(0);
		});
	});
});
