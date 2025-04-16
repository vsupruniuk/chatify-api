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

	describe('Find by nickname', (): void => {
		const expectedUser: User = users[5];

		const nicknameMock: string = expectedUser.nickname;

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedUser);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(usersRepository.findByNickname).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(usersRepository.findByNickname).toBeInstanceOf(Function);
		});

		it('should use query builder and create a query for searching a user by nickname', async (): Promise<void> => {
			await usersRepository.findByNickname(nicknameMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.nickname = :nickname', {
				nickname: nicknameMock,
			});

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: User | null = await usersRepository.findByNickname(nicknameMock);

			expect(user).toEqual(expectedUser);
		});

		it('should return return null if user was not found', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.findByNickname(nicknameMock);

			expect(user).toBeNull();
		});
	});
});
