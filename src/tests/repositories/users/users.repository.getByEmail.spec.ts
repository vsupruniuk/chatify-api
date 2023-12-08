import { FindOneOptions } from 'typeorm';

import { connectionSource } from '@DB/typeOrmConfig';

import { User } from '@Entities/User.entity';
import { UserShortDto } from '@DTO/users/UserShort.dto';

import { UsersRepository } from '@Repositories/users.repository';

import { users } from '@TestMocks/UserResponseDto/users';

import SpyInstance = jest.SpyInstance;

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	beforeEach((): void => {
		usersRepository = new UsersRepository(connectionSource);
	});

	describe('getByEmail', (): void => {
		let findMock: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserEmail: string = 'tony@mail.com';
		const notExistingUserEmail: string = 'bruce@mail.com';

		beforeEach((): void => {
			findMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation((options: FindOneOptions): Promise<User | null> => {
					return Promise.resolve(
						(usersMock.find(
							(user: UserShortDto) => user.email === options.where['email'],
						) as User) || null,
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getByEmail).toBeDefined();
		});

		it('should use findOne method for searching user', async (): Promise<void> => {
			await usersRepository.getByEmail(existingUserEmail);

			expect(findMock).toHaveBeenCalledWith({ where: { email: existingUserEmail } });
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersRepository.getByEmail(existingUserEmail);

			expect(foundedUser.email).toEqual(existingUserEmail);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersRepository.getByEmail(existingUserEmail);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser = await usersRepository.getByEmail(notExistingUserEmail);

			expect(foundedUser).toBeNull();
		});
	});
});
