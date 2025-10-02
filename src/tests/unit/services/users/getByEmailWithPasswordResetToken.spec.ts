import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { UsersService } from '@services';

import { IUsersRepository } from '@repositories';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

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
		usersRepository = moduleFixture.get(CustomProviders.CTF_USERS_REPOSITORY);
	});

	describe('Get by email with password reset token', (): void => {
		const userMock: User = users[0];
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[0];

		const email: string = userMock.email;

		beforeEach((): void => {
			jest
				.spyOn(usersRepository, 'findByEmailWithPasswordResetToken')
				.mockResolvedValue({ ...userMock, passwordResetToken: { ...passwordResetTokenMock } });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should call find by email with password reset token method from users repository to find a user', async (): Promise<void> => {
			await usersService.getByEmailWithPasswordResetToken(email);

			expect(usersRepository.findByEmailWithPasswordResetToken).toHaveBeenCalledTimes(1);
			expect(usersRepository.findByEmailWithPasswordResetToken).toHaveBeenNthCalledWith(1, email);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'findByEmailWithPasswordResetToken').mockResolvedValue(null);

			const user: UserWithPasswordResetTokenDto | null =
				await usersService.getByEmailWithPasswordResetToken(email);

			expect(user).toBeNull();
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: UserWithPasswordResetTokenDto | null =
				await usersService.getByEmailWithPasswordResetToken(email);

			expect(user).toEqual(
				plainToInstance(
					UserWithPasswordResetTokenDto,
					{
						...userMock,
						passwordResetToken: { ...passwordResetTokenMock },
					},
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should return a user as instance of UserWithPasswordResetTokenDto', async (): Promise<void> => {
			const user: UserWithPasswordResetTokenDto | null =
				await usersService.getByEmailWithPasswordResetToken(email);

			expect(user).toBeInstanceOf(UserWithPasswordResetTokenDto);
		});
	});
});
