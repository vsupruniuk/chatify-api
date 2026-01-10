import { CallHandler, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { AuthInterceptor } from '@interceptors';

import { providers } from '@modules/providers';

import { IJwtTokensService } from '@services';

import { CustomProvider } from '@enums';

import { User } from '@entities';

import { users } from '@testMocks';

import { JwtPayloadDto } from '@dtos/jwt';

import { AuthTypes } from '@customTypes';

describe('Auth interceptor', (): void => {
	let authInterceptor: AuthInterceptor;
	let jwtTokensService: IJwtTokensService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AuthInterceptor,

				JwtService,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		authInterceptor = moduleFixture.get(AuthInterceptor);
		jwtTokensService = moduleFixture.get(CustomProvider.CTF_JWT_TOKENS_SERVICE);
	});

	describe('Intercept', (): void => {
		const accessTokenMock: string = 'accessTokenMock';
		const userMock: User = users[3];
		const userPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});

		const requestMock: AuthTypes.TAuthorizedRequest = {
			headers: {
				authorization: `Bearer ${accessTokenMock}`,
			},
		} as AuthTypes.TAuthorizedRequest;

		const executionContext: ExecutionContext = {
			switchToHttp: () => ({
				getRequest: () => requestMock,
			}),
		} as ExecutionContext;

		const next: CallHandler = {
			handle: jest.fn(),
		};

		beforeEach((): void => {
			jest.spyOn(jwtTokensService, 'verifyAccessToken').mockResolvedValue(userPayload);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call verify access token method from jwt tokens service', async (): Promise<void> => {
			await authInterceptor.intercept(executionContext, next);

			expect(jwtTokensService.verifyAccessToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.verifyAccessToken).toHaveBeenNthCalledWith(1, accessTokenMock);
		});

		it('should throw unauthorized error if authorization header is not provided', async (): Promise<void> => {
			await expect(
				authInterceptor.intercept(
					{
						switchToHttp: () => ({
							getRequest: () => ({
								headers: {},
							}),
						}),
					} as ExecutionContext,
					next,
				),
			).rejects.toThrow(UnauthorizedException);
		});

		it('should throw unauthorized error if authorization token is not provided in the header', async (): Promise<void> => {
			await expect(
				authInterceptor.intercept(
					{
						switchToHttp: () => ({
							getRequest: () => ({
								headers: {
									authorization: 'Bearer',
								},
							}),
						}),
					} as ExecutionContext,
					next,
				),
			).rejects.toThrow(UnauthorizedException);
		});

		it('should throw unauthorized error if access token is invalid', async (): Promise<void> => {
			jest.spyOn(jwtTokensService, 'verifyAccessToken').mockResolvedValue(null);

			await expect(authInterceptor.intercept(executionContext, next)).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('should save user payload data in request object', async (): Promise<void> => {
			await authInterceptor.intercept(executionContext, next);

			expect(requestMock.user).toEqual(userPayload);
		});

		it('should call handle method to release the request flow', async (): Promise<void> => {
			await authInterceptor.intercept(executionContext, next);

			expect(next.handle).toHaveBeenCalled();
		});
	});
});
