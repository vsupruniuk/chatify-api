import { connectionSource } from '@DB/typeOrmConfig';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { FindOptionsWhere, ObjectId, UpdateResult } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(connectionSource);
	});

	describe('updateToken', (): void => {
		let updateMock: SpyInstance;

		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';
		const updateTokenMock: string = 'new-jwt-token-1';

		beforeEach((): void => {
			updateMock = jest
				.spyOn(jwtTokensRepository, 'update')
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
					): Promise<UpdateResult> => {
						const { id } = criteria as unknown as { id: string };

						return <UpdateResult>{
							raw: [],
							affected: id === existingTokenId ? 1 : 0,
							generatedMaps: [],
						};
					},
				);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', async (): Promise<void> => {
			expect(jwtTokensRepository.updateToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.updateToken).toBeInstanceOf(Function);
		});

		it('should call update method to update token', async (): Promise<void> => {
			await jwtTokensRepository.updateToken(existingTokenId, updateTokenMock);

			expect(updateMock).toHaveBeenCalled();
		});

		it('should return false if token with given id not exist', async (): Promise<void> => {
			const result: boolean = await jwtTokensRepository.updateToken(
				notExistingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(false);
		});

		it('should return true if token with given id exist and was updated', async (): Promise<void> => {
			const result: boolean = await jwtTokensRepository.updateToken(
				existingTokenId,
				updateTokenMock,
			);

			expect(result).toBe(true);
		});
	});
});
