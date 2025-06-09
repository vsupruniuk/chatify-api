import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';

describe('JWT tokens service', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtService: JwtService;

	const accessTokenSecretMock: string = 'accessTokenSecretMock';

	beforeAll(async (): Promise<void> => {
		process.env.JWT_ACCESS_TOKEN_SECRET = accessTokenSecretMock;

		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				JwtService,
				JwtTokensService,

				providers.CTF_JWT_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		jwtTokensService = moduleFixture.get(JwtTokensService);
		jwtService = moduleFixture.get(JwtService);
	});

	afterAll((): void => {
		delete process.env.JWT_ACCESS_TOKEN_SECRET;
	});

	describe('Verify access token', (): void => {
		const userMock: User = users[5];
		const payloadMock: JWTPayloadDto = {
			id: userMock.id,
			email: userMock.email,
			firstName: userMock.firstName,
			lastName: userMock.lastName,
			nickname: userMock.nickname,
		};

		const accessToken: string = jwtTokens[2].token as string;

		beforeEach((): void => {
			jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payloadMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensService.verifyAccessToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.verifyAccessToken).toBeInstanceOf(Function);
		});

		it('should call verify async method from jwt service to verify access token', async (): Promise<void> => {
			await jwtTokensService.verifyAccessToken(accessToken);

			expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
			expect(jwtService.verifyAsync).toHaveBeenNthCalledWith(1, accessToken, {
				secret: accessTokenSecretMock,
			});
		});

		it('should return user payload if access token valid', async (): Promise<void> => {
			const payload: JWTPayloadDto | null = await jwtTokensService.verifyAccessToken(accessToken);

			expect(payload).toBe(payloadMock);
		});

		it('should return null if access token is not valid', async (): Promise<void> => {
			jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

			const payload: JWTPayloadDto | null = await jwtTokensService.verifyAccessToken(accessToken);

			expect(payload).toBeNull();
		});
	});
});
