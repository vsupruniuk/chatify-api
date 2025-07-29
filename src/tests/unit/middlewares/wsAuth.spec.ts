import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { WsAuthMiddleware } from '@middlewares/wsAuth.middleware';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { Event } from 'socket.io';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { UnauthorizedException } from '@nestjs/common';
import { GlobalTypes } from '@customTypes/global';

describe('WS auth middleware', (): void => {
	let jwtTokensService: IJWTTokensService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				JwtService,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		jwtTokensService = moduleFixture.get(CustomProviders.CTF_JWT_TOKENS_SERVICE);
	});

	const userMock: User = users[3];
	const userPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
		excludeExtraneousValues: true,
	});
	const accessToken: string = 'accessToken';

	const event = {
		handshake: {
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		},
	} as unknown as Event;
	const next: jest.Mock = jest.fn();

	beforeEach((): void => {
		jest.spyOn(jwtTokensService, 'verifyAccessToken').mockResolvedValue(userPayload);
	});

	afterEach((): void => {
		jest.clearAllMocks();
		jest.restoreAllMocks();
	});

	it('should call verify access token method from jwt tokens service to verify user access token', async (): Promise<void> => {
		await WsAuthMiddleware(jwtTokensService)(event, next);

		expect(jwtTokensService.verifyAccessToken).toHaveBeenCalledTimes(1);
		expect(jwtTokensService.verifyAccessToken).toHaveBeenNthCalledWith(1, accessToken);
	});

	it('should call next handler with unauthorized error if auth header is not provided', async () => {
		await WsAuthMiddleware(jwtTokensService)(
			{
				handshake: {
					headers: {},
				},
			} as unknown as Event,
			next,
		);

		const error: UnauthorizedException = next.mock.calls[0][0];

		expect(next).toHaveBeenCalledTimes(1);
		expect(error).toBeInstanceOf(UnauthorizedException);
	});

	it('should call next handler with unauthorized error if access token is not provided in authorization header', async () => {
		await WsAuthMiddleware(jwtTokensService)(
			{
				handshake: {
					headers: {
						authorization: 'Bearer',
					},
				},
			} as unknown as Event,
			next,
		);

		const error: UnauthorizedException = next.mock.calls[0][0];

		expect(next).toHaveBeenCalledTimes(1);
		expect(error).toBeInstanceOf(UnauthorizedException);
	});

	it('should call next handler with unauthorized error if access token is invalid', async () => {
		jest.spyOn(jwtTokensService, 'verifyAccessToken').mockResolvedValue(null);

		await WsAuthMiddleware(jwtTokensService)(event, next);

		const error: UnauthorizedException = next.mock.calls[0][0];

		expect(next).toHaveBeenCalledTimes(1);
		expect(error).toBeInstanceOf(UnauthorizedException);
	});

	it('should call next handler without arguments if access token is valid', async () => {
		await WsAuthMiddleware(jwtTokensService)(event, next);

		expect(next).toHaveBeenCalledTimes(1);
		expect(next).toHaveBeenNthCalledWith(1);
	});

	it('should save user payload in event object', async (): Promise<void> => {
		await WsAuthMiddleware(jwtTokensService)(event, next);

		expect((event as unknown as GlobalTypes.TAuthorizedSocket).user).toEqual(userPayload);
	});
});
