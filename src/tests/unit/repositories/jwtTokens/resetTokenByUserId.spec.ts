import { Test, TestingModule } from '@nestjs/testing';

import { DataSource, UpdateResult } from 'typeorm';

import { QueryBuilderMock, jwtTokens, users } from '@testMocks';

import { JwtTokensRepository } from '@repositories';

import { JWTToken, User } from '@entities';

describe('JWT tokens repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let jwtTokensRepository: JwtTokensRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, JwtTokensRepository],
		}).compile();

		jwtTokensRepository = moduleFixture.get(JwtTokensRepository);
	});

	describe('Reset token by user id', (): void => {
		const expectedToken: JWTToken = { ...jwtTokens[0], token: null };
		const expectedUpdateResult: UpdateResult = { raw: [expectedToken], generatedMaps: [] };

		const userIdMock: string = users[5].id;
		const subqueryMock: string = 'subqueryMock';

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue(expectedUpdateResult);
			queryBuilderMock.getQuery.mockReturnValue(subqueryMock);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and create a sub query for searching token by user id', async (): Promise<void> => {
			await jwtTokensRepository.resetTokenByUserId(userIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.subQuery).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.select).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.select).toHaveBeenNthCalledWith(1, 'jwtToken.id');

			expect(queryBuilderMock.from).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.from).toHaveBeenNthCalledWith(1, JWTToken, 'jwtToken');

			expect(queryBuilderMock.innerJoin).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.innerJoin).toHaveBeenNthCalledWith(
				1,
				User,
				'user',
				'user.jwt_token_id = jwtToken.id',
			);

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'user.id = :userId', {
				userId: userIdMock,
			});

			expect(queryBuilderMock.getQuery).toHaveBeenCalledTimes(1);
		});

		it('should use query builder and create a query for updating token to null value', async (): Promise<void> => {
			await jwtTokensRepository.resetTokenByUserId(userIdMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(2);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, JWTToken);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, { token: null });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(2);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(2, `id IN (${subqueryMock})`);

			expect(queryBuilderMock.setParameters).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.setParameters).toHaveBeenNthCalledWith(1, { userId: userIdMock });

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should return updated token value', async (): Promise<void> => {
			const updatedToken: JWTToken = await jwtTokensRepository.resetTokenByUserId(userIdMock);

			expect(updatedToken).toEqual(expectedToken);
		});
	});
});
