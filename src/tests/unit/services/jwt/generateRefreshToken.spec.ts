import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';

import { JwtTokensService } from '@services';

import { providers } from '@modules/providers';

import { JwtPayloadDto } from '@dtos/jwt';

import { User } from '@entities';

import { users, jwtTokens } from '@testMocks';

describe('JWT tokens service', (): void => {
	let jwtTokensService: JwtTokensService;
	let jwtService: JwtService;

	const refreshTokenSecretMock: string = String(process.env.JWT_REFRESH_TOKEN_SECRET);
	const refreshTokenExpiresInMock: string = String(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN);

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
		jwtService = moduleFixture.get(JwtService);
	});

	describe('Generate refresh token', (): void => {
		const refreshTokenMock: string = jwtTokens[2].token as string;
		const userMock: User = users[5];

		const payload: JwtPayloadDto = {
			id: userMock.id,
			email: userMock.email,
			firstName: userMock.firstName,
			lastName: userMock.lastName,
			nickname: userMock.nickname,
		};

		beforeEach((): void => {
			jest.spyOn(jwtService, 'signAsync').mockResolvedValue(refreshTokenMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call sign async method from jwt service to generate refresh token', async (): Promise<void> => {
			await jwtTokensService.generateRefreshToken(payload);

			expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
			expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, payload, {
				secret: refreshTokenSecretMock,
				expiresIn: Number(refreshTokenExpiresInMock),
			});
		});

		it('should return generated refresh token', async (): Promise<void> => {
			const refreshToken: string = await jwtTokensService.generateRefreshToken(payload);

			expect(refreshToken).toBe(refreshTokenMock);
		});
	});
});
