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

	describe('getById', (): void => {
		let findMock: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserId: string = '1';
		const notExistingUserId: string = '5';

		beforeEach((): void => {
			findMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation((options: FindOneOptions): Promise<User | null> => {
					return Promise.resolve(
						(usersMock.find((user: UserShortDto) => user.id === options.where['id']) as User) ||
							null,
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getById).toBeDefined();
		});

		it('should use findOne method for searching user', async (): Promise<void> => {
			await usersRepository.getById(existingUserId);

			expect(findMock).toHaveBeenCalledWith({ where: { id: existingUserId } });
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersRepository.getById(existingUserId);

			expect(foundedUser.id).toEqual(existingUserId);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersRepository.getById(existingUserId);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser = await usersRepository.getById(notExistingUserId);

			expect(foundedUser).toBeNull();
		});
	});
});
