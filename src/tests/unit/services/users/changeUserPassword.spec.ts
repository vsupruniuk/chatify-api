import { UsersService } from '@services/users/users.service';
import { IUsersRepository } from '@repositories/users/IUsersRepository';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import { passwordResetTokens } from '@testMocks/PasswordResetToken/passwordResetTokens';

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

	describe('Change user password', (): void => {
		const userMock: User = users[2];
		const passwordResetTokenMock: PasswordResetToken = passwordResetTokens[2];

		const userId: string = userMock.id;
		const tokenId: string = passwordResetTokenMock.id;
		const password: string = 'Qwerty12345!';

		beforeEach((): void => {
			jest.spyOn(usersRepository, 'updatePassword').mockResolvedValue({ ...userMock, password });
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersService.changeUserPassword).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersService.changeUserPassword).toBeInstanceOf(Function);
		});

		it('should call update password method from users repository to update user password', async (): Promise<void> => {
			await usersService.changeUserPassword(userId, tokenId, password);

			expect(usersRepository.updatePassword).toHaveBeenCalledTimes(1);
			expect(usersRepository.updatePassword).toHaveBeenNthCalledWith(1, userId, tokenId, password);
		});

		it('should return true if password was changed', async (): Promise<void> => {
			const isUpdated: boolean = await usersService.changeUserPassword(userId, tokenId, password);

			expect(isUpdated).toBe(true);
		});

		it('should return false if password was not changed', async (): Promise<void> => {
			jest.spyOn(usersRepository, 'updatePassword').mockResolvedValue(null);

			const isUpdated: boolean = await usersService.changeUserPassword(userId, tokenId, password);

			expect(isUpdated).toBe(false);
		});
	});
});
