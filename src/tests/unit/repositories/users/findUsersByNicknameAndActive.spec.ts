import { Test, TestingModule } from '@nestjs/testing';

import { DataSource } from 'typeorm';

import { QueryBuilderMock, users } from '@testMocks';

import { UsersRepository } from '@repositories';

import { User } from '@entities';

describe('Users service', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let usersRepository: UsersRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, UsersRepository],
		}).compile();

		usersRepository = moduleFixture.get(UsersRepository);
	});

	describe('Find users by nickname and active', (): void => {
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

		it('should use query builder and create a query for a searching activated users by nickname pattern', async (): Promise<void> => {
			await usersRepository.findUsersByNicknameAndActive(nicknameMock, skipMock, takeMock);

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

		it('should return all founded users matching the query', async (): Promise<void> => {
			const users: User[] = await usersRepository.findUsersByNicknameAndActive(
				nicknameMock,
				skipMock,
				takeMock,
			);

			const actual = users.sort((firstUser, secondUser) =>
				firstUser.id.localeCompare(secondUser.id),
			);
			const expected = expectedUsers.sort((firstUser, secondUser) =>
				firstUser.id.localeCompare(secondUser.id),
			);

			expect(users).toHaveLength(expectedUsers.length);
			expect(actual).toEqual(expected);
		});

		it('should return empty array if no users were found', async (): Promise<void> => {
			queryBuilderMock.getMany.mockReturnValue([]);

			const users: User[] = await usersRepository.findUsersByNicknameAndActive(
				nicknameMock,
				skipMock,
				takeMock,
			);

			expect(users).toHaveLength(0);
		});
	});
});
