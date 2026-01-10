import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { User, PasswordResetToken } from '@entities';

import { users, passwordResetTokens } from '@testMocks';

import { UserWithPasswordResetTokenDto } from '@dtos/users';

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

	describe('Get by not expired password reset token', (): void => {
		const userMock: User = users[3];
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[3];

		const token: string = passwordResetTokenMock.token as string;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'findByNotExpiredPasswordResetToken')
				.mockResolvedValue({ ...userMock, passwordResetToken: { ...passwordResetTokenMock } });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call find by not expired password reset token method from users repository to find a user', async (): Promise<void> => {
			await usersService.getByNotExpiredPasswordResetToken(token);

			expect(usersRepository.findByNotExpiredPasswordResetToken).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByNotExpiredPasswordResetToken).toHaveBeenNthCalledWith(1, token);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByNotExpiredPasswordResetToken').mockResolvedValue(null);

			const user: UserWithPasswordResetTokenDto | null =
				await usersService.getByNotExpiredPasswordResetToken(token);

			expect(user).toBeNull();
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: UserWithPasswordResetTokenDto | null =
				await usersService.getByNotExpiredPasswordResetToken(token);

			expect(user).toEqual(
				plainToInstance(
					UserWithPasswordResetTokenDto,
					{ ...userMock, passwordResetToken: { ...passwordResetTokenMock } },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return a user as instance of UserWithPasswordResetTokenDto', async (): Promise<void> => {
			const user: UserWithPasswordResetTokenDto | null =
				await usersService.getByNotExpiredPasswordResetToken(token);

			expect(user).toBeInstanceOf(UserWithPasswordResetTokenDto);
		});
	});
});
