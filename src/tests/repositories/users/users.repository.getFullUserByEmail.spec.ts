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

	describe('getFullUserByEmail', (): void => {
		let findOneMock: SpyInstance;

		const usersMock: UserFullDto[] = [...users];
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';

		beforeEach((): void => {
			findOneMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<User | null> => {
					return (
						(usersMock.find(
							(user: UserFullDto) => user.email === options.where!['email'],
						) as User) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.getFullUserByEmail).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getFullUserByEmail).toBeInstanceOf(Function);
		});

		it('should call findOne method for searching user', async (): Promise<void> => {
			await usersRepository.getFullUserByEmail(existingUserEmail);

			expect(findOneMock).toHaveBeenCalledTimes(1);
			expect(findOneMock).toHaveBeenCalledWith({ where: { email: existingUserEmail } });
		});

		it('should return null if user does not exist', async (): Promise<void> => {
			const user: UserFullDto | null =
				await usersRepository.getFullUserByEmail(notExistingUserEmail);

			expect(user).toBeNull();
		});

		it('should return user if it exist', async (): Promise<void> => {
			const user: UserFullDto | null = await usersRepository.getFullUserByEmail(existingUserEmail);

			expect(user?.email).toBe(existingUserEmail);
		});

		it('should return user as instance of UserFullDto', async (): Promise<void> => {
			const user: UserFullDto | null = await usersRepository.getFullUserByEmail(existingUserEmail);

			expect(user).toBeInstanceOf(UserFullDto);
		});
	});
});
