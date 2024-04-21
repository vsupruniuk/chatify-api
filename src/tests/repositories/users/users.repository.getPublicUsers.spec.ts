import { User } from '@Entities/User.entity';
import { UsersRepository } from '@Repositories/users.repository';
import { users } from '@TestMocks/User/users';
import { DataSource } from 'typeorm';

describe('usersRepository', (): void => {
	let usersRepository: UsersRepository;

	let resolvedValue: User[] = [];

	const selectMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const andWhereMock: jest.Mock = jest.fn().mockReturnThis();
	const orderByMock: jest.Mock = jest.fn().mockReturnThis();
	const skipMock: jest.Mock = jest.fn().mockReturnThis();
	const takeMock: jest.Mock = jest.fn().mockReturnThis();
	const getManyMock: jest.Mock = jest
		.fn()
		.mockImplementation(async (): Promise<User[]> => resolvedValue);

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				select: selectMock,
				from: fromMock,
				where: whereMock,
				andWhere: andWhereMock,
				orderBy: orderByMock,
				skip: skipMock,
				take: takeMock,
				getMany: getManyMock,
			};
		}),
	};

	beforeEach((): void => {
		usersRepository = new UsersRepository(dataSourceMock);
	});

	describe('getPublicUsers', (): void => {
		const usersMock: User[] = [...users];

		beforeEach((): void => {
			resolvedValue = [];
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(usersRepository.getPublicUsers).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.getPublicUsers).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and find all active users by nickname', async (): Promise<void> => {
			const nickname: string = 'stark';
			const skip: number = 0;
			const take: number = 10;

			await usersRepository.getPublicUsers(nickname, skip, take);

			expect(selectMock).toHaveBeenCalledTimes(1);
			expect(selectMock).toHaveBeenCalledWith('user');

			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(User, 'user');

			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('user.nickname LIKE :nickname', {
				nickname: `%${nickname}%`,
			});

			expect(andWhereMock).toHaveBeenCalledTimes(1);
			expect(andWhereMock).toHaveBeenCalledWith('user.isActivated = :isActivated', {
				isActivated: true,
			});

			expect(orderByMock).toHaveBeenCalledTimes(1);
			expect(orderByMock).toHaveBeenCalledWith('user.nickname');

			expect(skipMock).toHaveBeenCalledTimes(1);
			expect(skipMock).toHaveBeenCalledWith(skip);

			expect(takeMock).toHaveBeenCalledTimes(1);
			expect(takeMock).toHaveBeenCalledWith(take);

			expect(getManyMock).toHaveBeenCalledTimes(1);
		});

		it('should return result as array of users', async (): Promise<void> => {
			const nickname: string = 'a';
			const skip: number = 0;
			const take: number = 10;

			resolvedValue = usersMock
				.filter(
					(user: User) =>
						user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated,
				)
				.slice(skip, take);

			const users: User[] = await usersRepository.getPublicUsers(nickname, skip, take);

			expect(users).toBeInstanceOf(Array);
		});

		it('should return each user in response as instance of User', async (): Promise<void> => {
			const nickname: string = 'a';
			const skip: number = 0;
			const take: number = 10;

			resolvedValue = usersMock
				.filter(
					(user: User) =>
						user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated,
				)
				.slice(skip, take);

			const users: User[] = await usersRepository.getPublicUsers(nickname, skip, take);

			users.forEach((user: User) => {
				expect(user).toBeInstanceOf(User);
			});
		});

		it('should return only activated users', async (): Promise<void> => {
			const nickname: string = 'a';
			const skip: number = 0;
			const take: number = 10;

			resolvedValue = usersMock
				.filter(
					(user: User) =>
						user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated,
				)
				.slice(skip, take);

			const users: User[] = await usersRepository.getPublicUsers(nickname, skip, take);

			users.forEach((user: User) => {
				expect(user.isActivated).toBe(true);
			});
		});

		it('should return only users which nickname include nickname from parameters', async (): Promise<void> => {
			const nickname: string = 'a';
			const skip: number = 0;
			const take: number = 10;

			resolvedValue = usersMock
				.filter(
					(user: User) =>
						user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated,
				)
				.slice(skip, take);

			const users: User[] = await usersRepository.getPublicUsers(nickname, skip, take);

			users.forEach((user: User) => {
				expect(user.nickname.toLowerCase().includes(nickname.toLowerCase())).toBe(true);
			});
		});

		it('should return empty array if users matched parameters does not exist', async (): Promise<void> => {
			const nickname: string = 'thanos';
			const skip: number = 0;
			const take: number = 10;

			resolvedValue = usersMock
				.filter(
					(user: User) =>
						user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated,
				)
				.slice(skip, take);

			const users: User[] = await usersRepository.getPublicUsers(nickname, skip, take);

			expect(users).toStrictEqual([]);
		});

		it('should search users case-insensitive', async (): Promise<void> => {
			const nickname: string = 'GROOT';
			const skip: number = 0;
			const take: number = 10;

			resolvedValue = usersMock
				.filter(
					(user: User) =>
						user.nickname.toLowerCase().includes(nickname.toLowerCase()) && user.isActivated,
				)
				.slice(skip, take);

			const users: User[] = await usersRepository.getPublicUsers(nickname, skip, take);

			expect(users.length).toBe(1);
		});
	});
});
