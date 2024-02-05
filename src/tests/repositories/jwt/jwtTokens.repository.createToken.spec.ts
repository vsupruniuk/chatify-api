import { connectionSource } from '@DB/typeOrmConfig';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { InsertResult } from 'typeorm';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(connectionSource);
	});

	describe('createToken', (): void => {
		let insertMock: SpyInstance;

		const id: string = '4';
		const token: string = 'jwt-token-4';

		beforeEach((): void => {
			insertMock = jest.spyOn(jwtTokensRepository, 'insert').mockResolvedValue(
				Promise.resolve(<InsertResult>{
					identifiers: <ObjectLiteral>[{ id }],
				}),
			);
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensRepository.createToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.createToken).toBeInstanceOf(Function);
		});

		it('should use insert method for creating token', async (): Promise<void> => {
			await jwtTokensRepository.createToken(token);

			expect(insertMock).toHaveBeenCalledTimes(1);
			expect(insertMock).toHaveBeenCalledWith({ token });
		});

		it('should return id of created token', async (): Promise<void> => {
			const tokenId: string = await jwtTokensRepository.createToken(token);

			expect(tokenId).toEqual(id);
		});
	});
});
