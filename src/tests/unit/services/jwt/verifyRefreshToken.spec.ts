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

	describe('Verify refresh token', (): void => {
		const refreshToken: string = jwtTokens[2].token as string;
		const userMock: User = users[5];
		const payloadMock: JwtPayloadDto = {
			id: userMock.id,
			email: userMock.email,
			firstName: userMock.firstName,
			lastName: userMock.lastName,
			nickname: userMock.nickname,
		};

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
			const payload: JwtPayloadDto | null = await jwtTokensService.verifyRefreshToken(refreshToken);

			expect(payload).toEqual(payloadMock);
		});

		it('should return null if refresh token is not valid', async (): Promise<void> => {
			jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error('Test error'));

			const payload: JwtPayloadDto | null = await jwtTokensService.verifyRefreshToken(refreshToken);

			expect(payload).toBeNull();
		});
	});
});
