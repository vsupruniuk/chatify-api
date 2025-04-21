import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';

describe('Users service', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Find activated users by nickname', (): void => {
		const expectedUsers: User[] = users.slice(3, 6);

		const nicknameMock: string = users[3].nickname;
		const skipMock: number = 5;
		const takeMock: number = 10;

		beforeEach((): void => {
			queryBuilderMock.getMany.mockReturnValue(expectedUsers);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.findActivatedUsersByNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.findActivatedUsersByNickname).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query for a searching activated users by nickname pattern', async (): Promise<void> => {
			await usersRepository.findActivatedUsersByNickname(nicknameMock, skipMock, takeMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.nickname LIKE :nickname', {
				nickname: `%${nicknameMock}%`,
			});

			expect(queryBuilderMock.andWhere).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.andWhere).toHaveBeenNthCalledWith(
				1,
				'user.isActivated = :isActivated',
				{ isActivated: true },
			);

			expect(queryBuilderMock.orderBy).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.orderBy).toHaveBeenNthCalledWith(1, 'user.nickname');

			expect(queryBuilderMock.skip).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.skip).toHaveBeenNthCalledWith(1, skipMock);

			expect(queryBuilderMock.take).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.take).toHaveBeenNthCalledWith(1, takeMock);

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
		});

		it('should return an Array', async (): Promise<void> => {
			const users: User[] = await usersRepository.findActivatedUsersByNickname(
				nicknameMock,
				skipMock,
				takeMock,
			);

			expect(users).toBeInstanceOf(Array);
		});

		it('should return all founded users matching the query', async (): Promise<void> => {
			const users: User[] = await usersRepository.findActivatedUsersByNickname(
				nicknameMock,
				skipMock,
				takeMock,
			);

			expect(users).toHaveLength(expectedUsers.length);

			expect(users.sort()).toEqual(expectedUsers.sort());
		});

		it('should return empty array if no users were found', async (): Promise<void> => {
			queryBuilderMock.getMany.mockReturnValue([]);

			const users: User[] = await usersRepository.findActivatedUsersByNickname(
				nicknameMock,
				skipMock,
				takeMock,
			);

			expect(users).toHaveLength(0);
		});
	});
});
