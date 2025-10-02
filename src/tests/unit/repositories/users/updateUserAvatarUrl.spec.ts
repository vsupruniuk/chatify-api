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

	describe('Update user avatar url', (): void => {
		const userIdMock: string = users[4].id;
		const userAvatarUrlMock: string | null = users[4].avatarUrl;

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a query for updating user avatar url', async (): Promise<void> => {
			await usersRepository.updateUserAvatarUrl(userIdMock, userAvatarUrlMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, User);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, { avatarUrl: userAvatarUrlMock });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :userId', {
				userId: userIdMock,
			});

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await usersRepository.updateUserAvatarUrl(userIdMock, userAvatarUrlMock);

			expect(result).toBeUndefined();
		});
	});
});
