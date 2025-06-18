import { UsersService } from '@services/users/users.service';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { TransformHelper } from '@helpers/transform.helper';
import { plainToInstance } from 'class-transformer';
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';
import { FullUserWithJwtTokenDto } from '@dtos/users/FullUserWithJwtTokenDto';

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

	describe('Get full user with jwt token by email', (): void => {
		const userMock: User = users[0];
		const jwtTokenMock: JWTToken = jwtTokens[0];

		const email: string = userMock.email;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'findFullUserWithJwtTokenByEmail')
				.mockResolvedValue({ ...userMock, jwtToken: { ...jwtTokenMock } });
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.getFullUserWithJwtTokenByEmail).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.getFullUserWithJwtTokenByEmail).toBeInstanceOf(Function);
		});

		it('should call find full user with jwt token by email method from users repository to find a user', async (): Promise<void> => {
			await usersService.getFullUserWithJwtTokenByEmail(email);

			expect(usersRepository.findFullUserWithJwtTokenByEmail).toHaveBeenCalledTimes(1);
			expect(usersRepository.findFullUserWithJwtTokenByEmail).toHaveBeenNthCalledWith(1, email);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findFullUserWithJwtTokenByEmail').mockResolvedValue(null);

			const user: FullUserWithJwtTokenDto | null =
				await usersService.getFullUserWithJwtTokenByEmail(email);

			expect(user).toBeNull();
		});

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await usersService.getFullUserWithJwtTokenByEmail(email);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(1, FullUserWithJwtTokenDto, {
				...userMock,
				jwtToken: { ...jwtTokenMock },
			});
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: FullUserWithJwtTokenDto | null =
				await usersService.getFullUserWithJwtTokenByEmail(email);

			expect(user).toEqual(
				plainToInstance(
					FullUserWithJwtTokenDto,
					{ ...userMock, jwtToken: { ...jwtTokenMock } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return a user as instance of FullUserWithJwtTokenDto', async (): Promise<void> => {
			const user: FullUserWithJwtTokenDto | null =
				await usersService.getFullUserWithJwtTokenByEmail(email);

			expect(user).toBeInstanceOf(FullUserWithJwtTokenDto);
		});
	});
});
