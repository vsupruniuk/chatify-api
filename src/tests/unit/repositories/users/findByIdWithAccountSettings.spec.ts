import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { QueryBuilderMock, users } from '@testMocks';

import { UsersRepository } from '@repositories';

import { User } from '@entities';

describe('Users repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Find by id with account settings', (): void => {
		const expectedUser: User = users[3];

		const idMock: string = expectedUser.id;

		beforeEach((): void => {
			queryBuilderMock.getOne.mockReturnValue(expectedUser);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a query for searching a user by id with account settings', async (): Promise<void> => {
			await usersRepository.findByIdWithAccountSettings(idMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'user');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, User, 'user');

			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.leftJoinAndSelect).toHaveBeenNthCalledWith(
				1,
				'user.accountSettings',
				'accountSettings',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.id = :id', { id: idMock });

			expect(queryBuilderMock.getOne).toHaveBeenCalledTimes(1);
		});

		it('should return a user if it was found', async (): Promise<void> => {
			const user: User | null = await usersRepository.findByIdWithAccountSettings(idMock);

			expect(user).toEqual(expectedUser);
		});

		it('should return null if user was not found', async (): Promise<void> => {
			queryBuilderMock.getOne.mockReturnValue(null);

			const user: User | null = await usersRepository.findByIdWithAccountSettings(idMock);

			expect(user).toBeNull();
		});
	});
});
