import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@services/users/users.service';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
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

	describe('Get by email or nickname', (): void => {
		const userMock: User = users[1];

		const email: string = userMock.email;
		const nickname: string = userMock.nickname;

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'findByEmailOrNickname').mockResolvedValue(userMock);
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getByEmailOrNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getByEmailOrNickname).toBeInstanceOf(Function);
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

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await usersService.getByEmailOrNickname(email, nickname);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(1, UserDto, userMock);
		});

		it('should return response as an instance of UserDto', async (): Promise<void> => {
			const user: UserDto | null = await usersService.getByEmailOrNickname(email, nickname);

			expect(user).toBeInstanceOf(UserDto);
		});
	});
});
