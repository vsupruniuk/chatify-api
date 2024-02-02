import { connectionSource } from '@DB/typeOrmConfig';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { jwtTokens } from '@TestMocks/JWTTokenFullDto/jwtTokens';
import { FindOneOptions } from 'typeorm';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensRepository', (): void => {
	let jwtTokensRepository: JWTTokensRepository;

	beforeEach((): void => {
		jwtTokensRepository = new JWTTokensRepository(connectionSource);
	});

	describe('getById', () => {
		let findMock: SpyInstance;

		const jwtTokensMock: JWTTokenFullDto[] = [...jwtTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '5';

		beforeEach((): void => {
			findMock = jest
				.spyOn(jwtTokensRepository, 'findOne')
				.mockImplementation(async (options: FindOneOptions): Promise<JWTToken | null> => {
					return (
						(jwtTokensMock.find(
							(token: JWTTokenFullDto) => token.id === options.where!['id'],
						) as JWTToken) || null
					);
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensRepository.getById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensRepository.getById).toBeInstanceOf(Function);
		});

		it('should use findOne method for searching token', async (): Promise<void> => {
			await jwtTokensRepository.getById(existingTokenId);

			expect(findMock).toHaveBeenCalledWith({ where: { id: existingTokenId } });
		});

		it('should find token, if it exist', async (): Promise<void> => {
			const foundedToken: JWTTokenFullDto | null =
				await jwtTokensRepository.getById(existingTokenId);

			expect(foundedToken?.id).toEqual(existingTokenId);
		});

		it('should return founded token as instance of JWTTokenFullDto', async (): Promise<void> => {
			const foundedToken: JWTTokenFullDto | null =
				await jwtTokensRepository.getById(existingTokenId);

			expect(foundedToken).toBeInstanceOf(JWTTokenFullDto);
		});

		it('should return null, if token not exist', async (): Promise<void> => {
			const foundedToken: JWTTokenFullDto | null =
				await jwtTokensRepository.getById(notExistingTokenId);

			expect(foundedToken).toBeNull();
		});
	});
});
