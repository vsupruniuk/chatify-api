import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { UsersRepository } from '@repositories/users/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Find all by ids', (): void => {
		const expectedUsers: User[] = users.slice(6, 10);

		const usersIdsMock: string[] = expectedUsers.map((user: User) => user.id);

		beforeEach((): void => {
			queryBuilderMock.getMany.mockReturnValue(expectedUsers);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.findAllByIds).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.findAllByIds).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query for searching all users by provided ids', async (): Promise<void> => {
			await usersRepository.findAllByIds(usersIdsMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.id IN (:...ids)', {
				ids: usersIdsMock,
			});

			expect(queryBuilderMock.getMany).toHaveBeenCalledTimes(1);
		});

		it('should return an Array', async (): Promise<void> => {
			const foundedUsers: User[] = await usersRepository.findAllByIds(usersIdsMock);

			expect(foundedUsers).toBeInstanceOf(Array);
		});

		it('should return all founded users with provided ids', async (): Promise<void> => {
			const foundedUsers: User[] = await usersRepository.findAllByIds(usersIdsMock);

			expect(foundedUsers).toHaveLength(expectedUsers.length);

			expect(foundedUsers.sort()).toEqual(expectedUsers.sort());
		});

		it('should return empty array if users were not found', async (): Promise<void> => {
			queryBuilderMock.getMany.mockReturnValue([]);

			const foundedUsers: User[] = await usersRepository.findAllByIds(usersIdsMock);

			expect(foundedUsers).toHaveLength(0);
		});
	});
});
