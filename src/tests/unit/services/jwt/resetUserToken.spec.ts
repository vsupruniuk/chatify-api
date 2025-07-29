import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { IJWTTokensRepository } from '@repositories/jwtTokens/IJWTTokensRepository';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';
import { users } from '@testMocks/User/users';

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

	describe('Reset user token', (): void => {
		const jwtTokenMock: JWTToken = jwtTokens[0];

		const userId: string = users[3].id;

		beforeEach((): void => {
			jest.spyOn(jwtTokensRepository, 'resetTokenByUserId').mockResolvedValue(jwtTokenMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call reset token by user id method from jwt tokens repository to reset user jwt token', async (): Promise<void> => {
			await jwtTokensService.resetUserToken(userId);

			expect(jwtTokensRepository.resetTokenByUserId).toHaveBeenCalledTimes(1);
			expect(jwtTokensRepository.resetTokenByUserId).toHaveBeenNthCalledWith(1, userId);
		});

		it('should return false if jwt token was not set to null', async (): Promise<void> => {
			const isReset: boolean = await jwtTokensService.resetUserToken(userId);

			expect(isReset).toBe(false);
		});

		it('should return true if jwt token was set to null', async (): Promise<void> => {
			jest
				.spyOn(jwtTokensRepository, 'resetTokenByUserId')
				.mockResolvedValue({ ...jwtTokenMock, token: null });

			const isReset: boolean = await jwtTokensService.resetUserToken(userId);

			expect(isReset).toBe(true);
		});
	});
});
