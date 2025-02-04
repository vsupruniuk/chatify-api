import { AuthController } from '@Controllers/auth.controller';
import { LoginResponseDto } from '@DTO/auth/LoginResponse.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { User } from '@Entities/User.entity';
import { CookiesNames } from '@Enums/CookiesNames.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { JwtTokensService } from '@Services/jwtTokens.service';
import { UsersService } from '@Services/users.service';
import { jwtTokens } from '@TestMocks/JWTToken/jwtTokens';
import { users } from '@TestMocks/User/users';
import { plainToInstance } from 'class-transformer';
import * as cookieParser from 'cookie-parser';
import { Response } from 'express';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const validToken: string = 'valid-token';
	const invalidToken: string = 'invalid-token';
	const notExistingToken: string = 'jwt-token-5';
	const newToken: string = 'jwt-access-token';
	const newTokenId: string = '10';
	const validTokenId: string = '2';
	const usersMock: User[] = [...users];
	const jwtTokensMock: JWTToken[] = [...jwtTokens];
	const notExistingTokenPayload: JWTPayloadDto = {
		id: 'f46845d7-90af-4c29-8e1a-227c90b33852',
		email: 'tony@mail.com',
		firstName: 'Tony',
		lastName: 'Stark',
		nickname: 't.stark',
	};
	const tokenPayload: JWTPayloadDto = {
		id: 'f46845d7-90af-4c29-8e1a-221c90b33852',
		email: 'thor@mail.com',
		firstName: 'Thor',
		lastName: 'Odinson',
		nickname: 't.odinson',
	};

	const responseMock: Partial<Response> = {
		cookie: jest.fn().mockImplementation((): void => {}),
	};

	const jwtTokensServiceMock: Partial<JwtTokensService> = {
		generateAccessToken: jest.fn().mockImplementation(async (): Promise<string> => newToken),

		generateRefreshToken: jest.fn().mockImplementation(async (): Promise<string> => newToken),

		verifyRefreshToken: jest
			.fn()
			.mockImplementation(async (token: string): Promise<JWTPayloadDto | null> => {
				if (token === notExistingToken) {
					return notExistingTokenPayload;
				}

				return token === validToken ? tokenPayload : null;
			}),

		getById: jest.fn().mockImplementation(async (id: string): Promise<JWTTokenFullDto | null> => {
			const token: JWTTokenFullDto | null =
				jwtTokensMock.find((token: JWTToken) => token.id === id) || null;

			return token
				? plainToInstance(JWTTokenFullDto, token, { excludeExtraneousValues: true })
				: null;
		}),

		saveRefreshToken: jest.fn().mockImplementation(async (): Promise<string> => newTokenId),
	};

	const usersServiceMock: Partial<UsersService> = {
		getFullUserByEmail: jest
			.fn()
			.mockImplementation(async (email: string): Promise<UserFullDto | null> => {
				const user: User | null = usersMock.find((user: User) => user.email === email) || null;

				return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
			}),

		updateUser: jest.fn().mockImplementation(async (): Promise<boolean> => true),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.CTF_JWT_TOKENS_SERVICE)
			.useValue(jwtTokensServiceMock)
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));
		app.use(cookieParser());

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/refresh', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.refresh).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.refresh).toBeInstanceOf(Function);
		});

		it('should return 401 status if refresh token invalid', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/auth/refresh')
				.set('Cookie', [CookiesNames.REFRESH_TOKEN + invalidToken])
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 401 status if refresh token valid, but not exist in DB', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/auth/refresh')
				.set('Cookie', [CookiesNames.REFRESH_TOKEN + notExistingToken])
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it('should return 200 status if refresh and access tokens were updated', async (): Promise<void> => {
			const responseResult = <SuccessfulResponseResult<LoginResponseDto>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [
					{
						accessToken: newToken,
					},
				],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.post('/auth/refresh')
				.set('Cookie', [`${CookiesNames.REFRESH_TOKEN}=${validToken}`])
				.expect(HttpStatus.OK)
				.expect(responseResult)
				.expect(Headers.SET_COOKIE, RegExp(CookiesNames.REFRESH_TOKEN));
		});

		it('should return response as instance of ResponseResult', async (): Promise<void> => {
			const result: ResponseResult = await authController.refresh(
				responseMock as Response,
				validToken,
			);

			expect(result).toBeInstanceOf(ResponseResult);
		});

		it('should call cookie method to set refreshToken to cookie', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(responseMock.cookie).toHaveBeenCalledTimes(1);
			expect(responseMock.cookie).toHaveBeenCalledWith(CookiesNames.REFRESH_TOKEN, newToken, {
				maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
				secure: true,
				sameSite: 'strict',
				httpOnly: true,
			});
		});

		it('should call generateAccessToken method to generate new access token', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.generateAccessToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.generateAccessToken).toHaveBeenCalledWith(tokenPayload);
		});

		it('should call generateRefreshToken method to generate new refresh token', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.generateRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.generateRefreshToken).toHaveBeenCalledWith(tokenPayload);
		});

		it('should call verifyRefreshToken method to check if refresh token valid or not', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.verifyRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.verifyRefreshToken).toHaveBeenCalledWith(validToken);
		});

		it('should call getById method to get token from DB', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.getById).toHaveBeenCalledWith(validTokenId);
		});

		it('should call saveRefreshToken method to save refresh token to DB', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledWith(validTokenId, newToken);
		});

		it('should call getFullUserByEmail method to find user from refresh token', async (): Promise<void> => {
			await authController.refresh(responseMock as Response, validToken);

			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledWith(tokenPayload.email);
		});
	});
});
