import { QueryBuilderMock } from '@testMocks/queryBuilderMock';
import { JwtTokensRepository } from '@repositories/jwtTokens/jwtTokens.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, UpdateResult } from 'typeorm';
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';

describe('JWT tokens repository', (): void => {
	const queryBuilderMock: QueryBuilderMock<object> = new QueryBuilderMock<object>();

	let jwtTokensRepository: JwtTokensRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [{ provide: DataSource, useValue: queryBuilderMock }, JwtTokensRepository],
		}).compile();

		jwtTokensRepository = moduleFixture.get(JwtTokensRepository);
	});

	describe('Update token', (): void => {
		const expectedToken: JWTToken = jwtTokens[0];
		const expectedUpdateResult: UpdateResult = { raw: [expectedToken], generatedMaps: [] };

		const idMock: string = expectedToken.id;
		const tokenMock: string = expectedToken.token as string;

		beforeEach((): void => {
			queryBuilderMock.execute.mockReturnValue(expectedUpdateResult);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should use query builder and build a query for updating JWT token', async (): Promise<void> => {
			await jwtTokensRepository.updateToken(idMock, tokenMock);

			expect(queryBuilderMock.createQueryBuilder).toHaveBeenCalledTimes(1);

			expect(queryBuilderMock.update).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.update).toHaveBeenNthCalledWith(1, JWTToken);

			expect(queryBuilderMock.set).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.set).toHaveBeenNthCalledWith(1, { token: tokenMock });

			expect(queryBuilderMock.where).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.where).toHaveBeenNthCalledWith(1, 'id = :id', { id: idMock });

			expect(queryBuilderMock.returning).toHaveBeenCalledTimes(1);
			expect(queryBuilderMock.returning).toHaveBeenNthCalledWith(1, '*');

			expect(queryBuilderMock.execute).toHaveBeenCalledTimes(1);
		});

		it('should return updated token', async (): Promise<void> => {
			const updatedToken: JWTToken = await jwtTokensRepository.updateToken(idMock, tokenMock);

			expect(updatedToken).toEqual(expectedToken);
		});
	});
});
