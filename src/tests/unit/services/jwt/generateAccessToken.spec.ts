import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';

describe('JWT tokens service', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtService: JwtService;

	const accessTokenSecretMock: string = 'accessTokenSecretMock';
	const accessTokenExpiresInMock: string = '10000';

	beforeAll(async (): Promise<void> => {
		process.env.JWT_ACCESS_TOKEN_SECRET = accessTokenSecretMock;
		process.env.JWT_ACCESS_TOKEN_EXPIRES_IN = accessTokenExpiresInMock;

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
		delete process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
	});

	describe('Generate access token', (): void => {
		const accessTokenMock: string = 'accessTokenMock';
		const userMock: User = users[5];

		const payload: JWTPayloadDto = {
			id: userMock.id,
			email: userMock.email,
			firstName: userMock.firstName,
			lastName: userMock.lastName,
			nickname: userMock.nickname,
		};

		beforeEach((): void => {
			jest.spyOn(jwtService, 'signAsync').mockResolvedValue(accessTokenMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should be declared', (): void => {
			expect(jwtTokensService.generateAccessToken).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(jwtTokensService.generateAccessToken).toBeInstanceOf(Function);
		});

		it('should call sign async method from jwt', async (): Promise<void> => {
			await jwtTokensService.generateAccessToken(payload);

			expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
			expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
				secret: accessTokenSecretMock,
				expiresIn: Number(accessTokenExpiresInMock),
			});
		});

		it('should return generated access token', async (): Promise<void> => {
			const accessToken: string = await jwtTokensService.generateAccessToken(payload);

			expect(accessToken).toBe(accessTokenMock);
		});
	});
});
