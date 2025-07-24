import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { CallHandler, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { plainToInstance } from 'class-transformer';
import { GlobalTypes } from '@customTypes/global';

describe('Auth interceptor', (): void => {
	let authInterceptor: AuthInterceptor;
	let jwtTokensService: IJWTTokensService;

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
		jwtTokensService = moduleFixture.get(CustomProviders.CTF_JWT_TOKENS_SERVICE);
	});

	describe('Intercept', (): void => {
		const userMock: User = users[3];
		const userPayload: JWTPayloadDto = plainToInstance(JWTPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});

		const accessTokenMock: string = 'accessTokenMock';
		const requestMock: GlobalTypes.TAuthorizedRequest = {
			headers: {
				authorization: `Bearer ${accessTokenMock}`,
			},
		} as GlobalTypes.TAuthorizedRequest;

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

		it('should be defined', (): void => {
			expect(authInterceptor.intercept).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authInterceptor.intercept).toBeInstanceOf(Function);
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
