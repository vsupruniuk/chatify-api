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

	describe('getByNickname', (): void => {
		let findMock: SpyInstance;

		const usersMock: UserShortDto[] = [...users];
		const existingUserNickname: string = 't.stark';
		const notExistingUserNickname: string = 'b.banner';

		beforeEach((): void => {
			findMock = jest
				.spyOn(usersRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<User | null> => {
					return (
						(usersMock.find(
							(user: UserShortDto) => user.nickname === options.where['nickname'],
						) as User) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getByNickname).toBeDefined();
		});

		it('should use findOne method for searching user', async (): Promise<void> => {
			await usersRepository.getByNickname(existingUserNickname);

			expect(findMock).toHaveBeenCalledWith({ where: { nickname: existingUserNickname } });
		});

		it('should find user, if it exist', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersRepository.getByNickname(existingUserNickname);

			expect(foundedUser.nickname).toEqual(existingUserNickname);
		});

		it('should return founded user as instance of UserShortDto', async (): Promise<void> => {
			const foundedUser: UserShortDto = await usersRepository.getByNickname(existingUserNickname);

			expect(foundedUser).toBeInstanceOf(UserShortDto);
		});

		it('should return null, if user not exist', async (): Promise<void> => {
			const foundedUser = await usersRepository.getByNickname(notExistingUserNickname);

			expect(foundedUser).toBeNull();
		});
	});
});
