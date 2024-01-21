import { connectionSource } from '@DB/typeOrmConfig';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { User } from '@Entities/User.entity';
import { UsersRepository } from '@Repositories/users.repository';
import { users } from '@TestMocks/UserFullDto/users';
import { FindOneOptions } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
	});

	describe('getByResetPasswordToken', (): void => {
		let findMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserToken: string = '1662043c-4d4b-4424-ac31-45189dedd099';
		const notExistingUserToken: string = '1662043c-4d4b-4424-ac31-45189dedd090';

		beforeEach((): void => {
			findMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<User | null> => {
					return (
						(usersMock.find(
							(user: UserFullDto) =>
								user.passwordResetToken === options.where!['passwordResetToken'],
						) as User) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.getByResetPasswordToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getByResetPasswordToken).toBeInstanceOf(Function);
		});

		it('should call findOne method to search user', async (): Promise<void> => {
			await usersRepository.getByResetPasswordToken(existingUserToken);

			expect(findMock).toHaveBeenCalledWith({ where: { passwordResetToken: existingUserToken } });
		});

		it('should return null if user not exist', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersRepository.getByResetPasswordToken(notExistingUserToken);

			expect(user).toBeNull();
		});

		it('should return user if it exist', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersRepository.getByResetPasswordToken(existingUserToken);

			expect(user?.passwordResetToken).toBe(existingUserToken);
		});

		it('should return user as instance of UserFullDto', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersRepository.getByResetPasswordToken(existingUserToken);

			expect(user).toBeInstanceOf(UserFullDto);
		});
	});
});
