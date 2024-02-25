import { JWTToken } from '@Entities/JWTToken.entity';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { DataSource, DeleteResult } from 'typeorm';

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	let resolvedAffectedValue: number = 0;

	const deleteMock: jest.Mock = jest.fn().mockReturnThis();
	const fromMock: jest.Mock = jest.fn().mockReturnThis();
	const whereMock: jest.Mock = jest.fn().mockReturnThis();
	const executeMock: jest.Mock = jest.fn().mockImplementation(async (): Promise<DeleteResult> => {
		return <DeleteResult>{
			raw: [],
			affected: resolvedAffectedValue,
		};
	});

	const dataSourceMock: jest.Mocked<DataSource> = {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		createQueryBuilder: jest.fn(() => {
			return {
				delete: deleteMock,
				from: fromMock,
				where: whereMock,
				execute: executeMock,
			};
		}),
	};

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(dataSourceMock);
	});

	describe('deleteToken', (): void => {
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';

		beforeEach((): void => {
			resolvedAffectedValue = 0;
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(jwtTokensRepository.deleteToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.deleteToken).toBeInstanceOf(Function);
		});

		it('should user queryBuilder to build query and delete JWT token', async (): Promise<void> => {
			await jwtTokensRepository.deleteToken(existingTokenId);

			expect(deleteMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledTimes(1);
			expect(fromMock).toHaveBeenCalledWith(JWTToken);
			expect(whereMock).toHaveBeenCalledTimes(1);
			expect(whereMock).toHaveBeenCalledWith('id = :id', { id: existingTokenId });
			expect(executeMock).toHaveBeenCalledTimes(1);
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await jwtTokensRepository.deleteToken(notExistingTokenId);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was deleted', async (): Promise<void> => {
			resolvedAffectedValue = 1;

			const result: boolean = await jwtTokensRepository.deleteToken(existingTokenId);

			expect(result).toBe(true);
		});
	});
});
