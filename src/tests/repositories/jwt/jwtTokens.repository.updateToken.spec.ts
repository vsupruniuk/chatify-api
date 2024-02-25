import { JWTToken } from '@Entities/JWTToken.entity';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { DataSource, UpdateResult } from 'typeorm';

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	let resolvedAffectedValue: number = 0;

	const updateMock: jest.Mock = jest.fn().mockReturnThis();
	const setMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<UpdateResult> => {
		return <UpdateResult>{
			raw: [],
			affected: resolvedAffectedValue,
			generatedMaps: [],
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				update: updateMock,
				set: setMock,
				where: whereMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(dataSourceMock);
	});

	describe('updateToken', (): void => {
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const updateTokenMock: string = 'new-jwt-token-1';

		beforeEach((): void => {
			resolvedAffectedValue = 0;
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(jwtTokensRepository.updateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.updateToken).toBeInstanceOf(Function);
		});

		it('should use queryBuilder to build query and update token', async (): Promise<void> => {
			await jwtTokensRepository.updateToken(existingTokenId, updateTokenMock);

			expect(updateMock).toHaveBeenCalledTimes(1);
			expect(updateMock).toHaveBeenCalledWith(JWTToken);
			expect(setMock).toHaveBeenCalledTimes(1);
			expect(setMock).toHaveBeenCalledWith({ token: updateTokenMock });
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('id = :id', { id: existingTokenId });
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await jwtTokensRepository.updateToken(
				notExistingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was updated', async (): Promise<void> => {
			resolvedAffectedValue = 1;

			const result: boolean = await jwtTokensRepository.updateToken(
				existingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(true);
		});
	});
});
