import { AuthController } from '@Controllers/auth.controller';
import { LoginDto } from '@DTO/auth/Login.dto';
import { LoginResponseDto } from '@DTO/auth/LoginResponse.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { CookiesNames } from '@Enums/CookiesNames';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { users } from '@TestMocks/UserFullDto/users';
import { Headers } from '@Enums/Headers';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: UserFullDto[] = [...users];
	const responceMock: Partial<Response> = {
		cookie: jest.fn(),
	};

	const jwtTokensServiceMock: Partial<IJWTTokensService> = {
		generateAccessToken: jest.fn().mockImplementation(async (): Promise<string> => {
			return 'jwt-access-token';
		}),

		generateRefreshToken: jest.fn().mockImplementation(async (): Promise<string> => {
			return 'jwt-refresh-token';
		}),

		saveRefreshToken: jest.fn().mockImplementation(async (): Promise<boolean> => true),
	};

	const usersServiceMock: Partial<IUsersService> = {
		getFullUserByEmail: jest
			.fn()
			.mockImplementation(async (email: string): Promise<UserFullDto | null> => {
				return usersMock.find((user: UserFullDto) => user.email === email) || null;
			}),

		updateUser: jest.fn().mockImplementation(async (): Promise<boolean> => true),
	};

	const authServiceMock: Partial<IAuthService> = {
		validatePassword: jest
			.fn()
			.mockImplementation(
				async (passwordFromDto: string, passwordFromDb: string): Promise<boolean> => {
					return passwordFromDto === passwordFromDb;
				},
			),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.I_JWT_TOKENS_SERVICE)
			.useValue(jwtTokensServiceMock)
			.overrideProvider(CustomProviders.I_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.I_AUTH_SERVICE)
			.useValue(authServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/login', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.signup).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.signup).toBeInstanceOf(Function);
		});

		it('should return 400 status if email is missing', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email in wrong format', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tonymail.com',
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is not a string', async (): Promise<void> => {
			const loginDto = {
				email: 'tony@mail.com',
				password: 2,
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password is too short', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwe',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password does not contains at least 1 number', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyAA',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password does not contains at least 1 upper case letter', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwerty11',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status email too long', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com'.padStart(256, 't'),
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status password too long', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwerty1A'.padStart(256, 'q'),
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if user with email does not exist', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'bruce@mail.com',
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 status if password is wrong', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 200 status if password is correct and email exist', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const responseResult = <SuccessfulResponseResult<LoginResponseDto>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [{ accessToken: 'jwt-access-token' }],
				dataLength: 1,
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.OK)
				.expect(responseResult);
		});

		it('should set refresh token to cookies', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.OK)
				.expect(Headers.SET_COOKIE, RegExp(CookiesNames.REFRESH_TOKEN));
		});

		it('should call getFullUserByEmail in usersService to find user', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await authController.login(responceMock as Response, loginDto);

			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledWith(loginDto.email);
		});

		it('should call validatePassword in authService to check if user password valid or not', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await authController.login(responceMock as Response, loginDto);

			expect(authServiceMock.validatePassword).toHaveBeenCalledTimes(1);
			expect(authServiceMock.validatePassword).toHaveBeenCalledWith(
				loginDto.password,
				loginDto.password,
			);
		});

		it('should call generateAccessToken in jwtTokensService to generate access token for user', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);

			await authController.login(responceMock as Response, loginDto);

			expect(jwtTokensServiceMock.generateAccessToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.generateAccessToken).toHaveBeenCalledWith({
				id: user?.id,
				email: user?.email,
				firstName: user?.firstName,
				lastName: user?.lastName,
				nickname: user?.nickname,
			});
		});

		it('should call generateRefreshToken in jwtTokensService to generate refresh token for user', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);

			await authController.login(responceMock as Response, loginDto);

			expect(jwtTokensServiceMock.generateRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.generateRefreshToken).toHaveBeenCalledWith({
				id: user?.id,
				email: user?.email,
				firstName: user?.firstName,
				lastName: user?.lastName,
				nickname: user?.nickname,
			});
		});

		it('should call saveRefreshToken in jwtTokensService to save user refresh token to DB', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);
			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);

			await authController.login(responceMock as Response, loginDto);

			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledWith(
				user?.JWTTokenId,
				refreshToken,
			);
		});

		it('should call updateUser in usersService to update user JWT token id', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);
			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);
			const id: string = await jwtTokensServiceMock.saveRefreshToken!(
				user!.JWTTokenId,
				refreshToken,
			);

			await authController.login(responceMock as Response, loginDto);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(user?.id, { JWTTokenId: id });
		});

		it('should return response as instance of SuccessfulResponseResult', async (): Promise<void> => {
			const loginDto = <LoginDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const response: ResponseResult = await authController.login(
				responceMock as Response,
				loginDto,
			);

			expect(response).toBeInstanceOf(SuccessfulResponseResult);
		});
	});
});
