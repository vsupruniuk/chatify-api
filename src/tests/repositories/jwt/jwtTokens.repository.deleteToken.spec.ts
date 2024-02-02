import { connectionSource } from '@DB/typeOrmConfig';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { DeleteResult, FindOptionsWhere, ObjectId } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(connectionSource);
	});

	describe('deleteToken', (): void => {
		let deleteMock: SpyInstance;

		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';

		beforeEach((): void => {
			deleteMock = jest
				.spyOn(jwtTokensRepository, 'delete')
				.mockImplementation(
					async <T>(
						criteria:
							| string
							| number
							| string[]
							| Date
							| ObjectId
							| number[]
							| Date[]
							| ObjectId[]
							| FindOptionsWhere<T>,
					): Promise<DeleteResult> => {
						const { id } = criteria as unknown as { id: string };

						return {
							raw: [],
							affected: id === existingTokenId ? 1 : 0,
						};
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(jwtTokensRepository.deleteToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.deleteToken).toBeInstanceOf(Function);
		});

		it('should call delete method to update token', async (): Promise<void> => {
			await jwtTokensRepository.deleteToken(existingTokenId);

			expect(deleteMock).toHaveBeenCalledWith({ id: existingTokenId });
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await jwtTokensRepository.deleteToken(notExistingTokenId);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was deleted', async (): Promise<void> => {
			const result: boolean = await jwtTokensRepository.deleteToken(existingTokenId);

			expect(result).toBe(true);
		});
	});
});
