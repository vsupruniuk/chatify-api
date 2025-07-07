import { UsersService } from '@services/users/users.service';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { TransformHelper } from '@helpers/transform.helper';
import { UserDto } from '@dtos/users/UserDto';
import { plainToInstance } from 'class-transformer';

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

	describe('Get all by ids', (): void => {
		const usersMock: User[] = users.slice(1, 4);

		const ids: string[] = usersMock.map((user: User) => user.id);

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findAllByIds').mockResolvedValue(usersMock);
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getAllByIds).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getAllByIds).toBeInstanceOf(Function);
		});

		it('should call find all by ids method form users repository to get all users', async (): Promise<void> => {
			await usersService.getAllByIds(ids);

			expect(usersRepository.findAllByIds).toHaveBeenCalledTimes(1);
			expect(usersRepository.findAllByIds).toHaveBeenNthCalledWith(1, ids);
		});

		it('should return all founded users', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getAllByIds(ids);

			expect(users).toEqual(
				usersMock.map((user: User) =>
					plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
				),
			);
		});

		it('should call to target dto method from transform helper to transform each user to appropriate dto', async (): Promise<void> => {
			await usersService.getAllByIds(ids);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(usersMock.length);

			usersMock.forEach((user: User, index: number) => {
				expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(index + 1, UserDto, user);
			});
		});

		it('should return an Array', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getAllByIds(ids);

			expect(users).toBeInstanceOf(Array);
		});

		it('should return each user as instance of UserDto', async (): Promise<void> => {
			const users: UserDto[] = await usersService.getAllByIds(ids);

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
