import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { User, OTPCode, JWTToken } from '@entities';

import { users, jwtTokens, otpCodes } from '@testMocks';

import { UserWithJwtTokenDto } from '@dtos/users';

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

	describe('Activate user', (): void => {
		const userMock: User = users[5];
		const otpCodeMock: OTPCode = otpCodes[3];
		const jwtTokenMock: JWTToken = jwtTokens[3];

		const userId: string = userMock.id;
		const otpCodeId: string = otpCodeMock.id;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'activateUser')
				.mockResolvedValue({ ...userMock, jwtToken: { ...jwtTokenMock } });
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.restoreAllMocks();
		});

		it('should call activate user method from users repository to activate user account', async (): Promise<void> => {
			await usersService.activateUser(userId, otpCodeId);

			expect(usersRepository.activateUser).toHaveBeenCalledTimes(1);
			expect(usersRepository.activateUser).toHaveBeenNthCalledWith(1, userId, otpCodeId);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'activateUser').mockResolvedValue(null);

			const user: UserWithJwtTokenDto | null = await usersService.activateUser(userId, otpCodeId);

			expect(user).toBeNull();
		});

		it('should return founded user', async (): Promise<void> => {
			const user: UserWithJwtTokenDto | null = await usersService.activateUser(userId, otpCodeId);

			expect(user).toEqual(
				plainToInstance(
					UserWithJwtTokenDto,
					{ ...userMock, jwtToken: { ...jwtTokenMock } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return user as instance of UserWithJwtTokenDto', async (): Promise<void> => {
			const user: UserWithJwtTokenDto | null = await usersService.activateUser(userId, otpCodeId);

			expect(user).toBeInstanceOf(UserWithJwtTokenDto);
		});
	});
});
