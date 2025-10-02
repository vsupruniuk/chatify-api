import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';

import { JwtTokensService } from '@services';

import { providers } from '@modules/providers';

import { JWTPayloadDto } from '@dtos/jwt';

import { User } from '@entities';

import { users, jwtTokens } from '@testMocks';

describe('JWT tokens service', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtService: JwtService;

	const refreshTokenSecretMock: string = 'refreshTokenSecretMock';

	beforeAll(async (): Promise<void> => {
		process.env.JWT_REFRESH_TOKEN_SECRET = refreshTokenSecretMock;

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
		delete process.env.JWT_REFRESH_TOKEN_SECRET;
	});

	describe('Verify refresh token', (): void => {
		const userMock: User = users[5];
		const payloadMock: JWTPayloadDto = {
			id: userMock.id,
			email: userMock.email,
			firstName: userMock.firstName,
			lastName: userMock.lastName,
			nickname: userMock.nickname,
		};

		const refreshToken: string = jwtTokens[2].token as string;

		beforeEach((): void => {
			jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payloadMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call verify async method from jwt service to verify refresh token', async (): Promise<void> => {
			await jwtTokensService.verifyRefreshToken(refreshToken);

			expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
			expect(jwtService.verifyAsync).toHaveBeenNthCalledWith(1, refreshToken, {
				secret: refreshTokenSecretMock,
			});
		});

		it('should return user payload if refresh token valid', async (): Promise<void> => {
			const payload: JWTPayloadDto | null = await jwtTokensService.verifyRefreshToken(refreshToken);

			expect(payload).toEqual(payloadMock);
		});

		it('should return null if refresh token is not valid', async (): Promise<void> => {
			jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

			const payload: JWTPayloadDto | null = await jwtTokensService.verifyRefreshToken(refreshToken);

			expect(payload).toBeNull();
		});
	});
});
