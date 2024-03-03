import { connectionSource } from '@DB/typeOrmConfig';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { JwtService } from '@nestjs/jwt';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { JwtTokensService } from '@Services/jwtTokens.service';
import { jwtTokens } from '@TestMocks/JWTToken/jwtTokens';
import SpyInstance = jest.SpyInstance;

describe('jwtTokensService', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtTokensRepository: JWTTokensRepository;

	beforeEach((): void => {
		const jwtService: JwtService = new JwtService();
		jwtTokensRepository = new JWTTokensRepository(connectionSource);

		jwtTokensService = new JwtTokensService(jwtService, jwtTokensRepository);
	});

	describe('getById', (): void => {
		let getByIdMock: SpyInstance;

		const jwtTokensMock: JWTToken[] = [...jwtTokens];
		const existingTokenId: string = '1';
		const notExistingTokenId: string = '4';

		beforeEach((): void => {
			getByIdMock = jest
				.spyOn(jwtTokensRepository, 'getById')
				.mockImplementation(async (id: string): Promise<JWTToken | null> => {
					return jwtTokensMock.find((token: JWTToken) => token.id === id) || null;
				});
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensService.getById).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.getById).toBeInstanceOf(Function);
		});

		it('should call getById method in jwtTokens repository to get token by id', async (): Promise<void> => {
			await jwtTokensService.getById(existingTokenId);

			expect(getByIdMock).toHaveBeenCalledTimes(1);
			expect(getByIdMock).toHaveBeenCalledWith(existingTokenId);
		});

		it('should return token if it was find', async (): Promise<void> => {
			const token: JWTTokenFullDto | null = await jwtTokensService.getById(existingTokenId);

			expect(token?.id).toBe(existingTokenId);
		});

		it('should return token as instance of JWTTokenFullDto', async (): Promise<void> => {
			const token: JWTTokenFullDto | null = await jwtTokensService.getById(existingTokenId);

			expect(token).toBeInstanceOf(JWTTokenFullDto);
		});

		it('should return null if it was not find', async (): Promise<void> => {
			const token: JWTTokenFullDto | null = await jwtTokensService.getById(notExistingTokenId);

			expect(token).toBe(null);
		});
	});
});
