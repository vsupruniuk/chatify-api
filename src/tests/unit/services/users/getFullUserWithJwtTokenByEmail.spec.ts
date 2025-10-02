import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { User, JWTToken } from '@entities';

import { users, jwtTokens } from '@testMocks';

import { FullUserWithJwtTokenDto } from '@dtos/users';

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
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
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
