import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { IJWTTokensRepository } from '@repositories/jwtTokens/IJWTTokensRepository';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';

describe('JWT tokens service', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtTokensRepository: IJWTTokensRepository;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				JwtService,
				JwtTokensService,

				providers.CTF_JWT_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		jwtTokensService = moduleFixture.get(JwtTokensService);
		jwtTokensRepository = moduleFixture.get(CustomProviders.CTF_JWT_TOKENS_REPOSITORY);
	});

	describe('Save refresh token', (): void => {
		const refreshTokenMock: JWTToken = jwtTokens[1];

		const id: string = refreshTokenMock.id;
		const token: string = refreshTokenMock.token as string;

		beforeEach((): void => {
			jest.spyOn(jwtTokensRepository, 'updateToken').mockImplementation(jest.fn());
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should be defined', (): void => {
			expect(jwtTokensService.saveRefreshToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.saveRefreshToken).toBeInstanceOf(Function);
		});

		it('should call update token method from jwt tokens repository to update user refresh token', async (): Promise<void> => {
			await jwtTokensService.saveRefreshToken(id, token);

			expect(jwtTokensRepository.updateToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensRepository.updateToken).toHaveBeenNthCalledWith(1, id, token);
		});

		it('should return nothing', async (): Promise<void> => {
			const result: void = await jwtTokensService.saveRefreshToken(id, token);

			expect(result).toBeUndefined();
		});
	});
});
