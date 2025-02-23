import { AuthController } from '@controllers/auth/auth.controller';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { AppModule } from '@modules/app.module';
import { AuthModule } from '@modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import * as request from 'supertest';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { JWTTokenFullDto } from '../../../types/dto/JWTTokens/JWTTokenFull.dto';
import { IUsersService } from '@services/users/IUsersService';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';
import { IAuthService } from '@services/auth/IAuthService';
import { LoginRequestDto } from '@dtos/auth/login/LoginRequest.dto';
import { CookiesNames } from '@enums/CookiesNames.enum';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';

describe.skip('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const usersMock: User[] = [...users];
	const jwtTokensMock: JWTToken[] = [...jwtTokens];
	const existingTokenId: string = '1';
	const newTokenId: string = '1';
	const responseMock: Partial<Response> = {
		cookie: jest.fn(),
	};

	const jwtTokensServiceMock: Partial<IJWTTokensService> = {
		getById: jest.fn().mockImplementation(async (id: string): Promise<JWTTokenFullDto | null> => {
			const token: JWTTokenFullDto | null =
				jwtTokensMock.find((token: JWTToken) => token.id === id) || null;

			return token
				? plainToInstance(JWTTokenFullDto, token, { excludeExtraneousValues: true })
				: null;
		}),

		generateAccessToken: jest.fn().mockImplementation(async (): Promise<string> => {
			return 'jwt-access-token';
		}),

		generateRefreshToken: jest.fn().mockImplementation(async (): Promise<string> => {
			return 'jwt-refresh-token';
		}),

		saveRefreshToken: jest
			.fn()
			.mockImplementation(
				async (id: string): Promise<string> =>
					id === existingTokenId ? existingTokenId : newTokenId,
			),
	};

	const usersServiceMock: Partial<IUsersService> = {
		getFullUserByEmail: jest
			.fn()
			.mockImplementation(async (email: string): Promise<UserFullDto | null> => {
				const user: User | null = usersMock.find((user: User) => user.email === email) || null;

				return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
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
			.overrideProvider(CustomProviders.CTF_JWT_TOKENS_SERVICE)
			.useValue(jwtTokensServiceMock)
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
			.overrideProvider(CustomProviders.CTF_AUTH_SERVICE)
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
			const loginDto = <LoginRequestDto>{
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if email in wrong format', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
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
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwe',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password does not contains at least 1 number', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyAA',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if password does not contains at least 1 upper case letter', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwerty11',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status email too long', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com'.padStart(256, 't'),
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status password too long', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwerty1A'.padStart(256, 'q'),
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if user with email does not exist', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'bruce@mail.com',
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 422 status if password is wrong', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwerty1A',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.UNPROCESSABLE_ENTITY);
		});

		it('should return 200 status if password is correct and email exist', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await request(app.getHttpServer()).post('/auth/login').send(loginDto).expect(HttpStatus.OK);
		});

		it('should set refresh token to cookies', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await request(app.getHttpServer())
				.post('/auth/login')
				.send(loginDto)
				.expect(HttpStatus.OK)
				.expect(Headers.SET_COOKIE, RegExp(CookiesNames.REFRESH_TOKEN));
		});

		it('should call cookie method to set refreshToken to cookie', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const token: string = await jwtTokensServiceMock.generateRefreshToken!({} as JWTPayloadDto);

			await authController.login(responseMock as Response, loginDto);

			expect(responseMock.cookie).toHaveBeenCalledTimes(1);
			expect(responseMock.cookie).toHaveBeenCalledWith(CookiesNames.REFRESH_TOKEN, token, {
				maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
				secure: true,
				sameSite: 'strict',
				httpOnly: true,
			});
		});

		it('should call getFullUserByEmail in usersService to find user', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await authController.login(responseMock as Response, loginDto);

			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledWith(loginDto.email);
		});

		it('should call validatePassword in authService to check if user password valid or not', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			await authController.login(responseMock as Response, loginDto);

			expect(authServiceMock.validatePassword).toHaveBeenCalledTimes(1);
			expect(authServiceMock.validatePassword).toHaveBeenCalledWith(
				loginDto.password,
				loginDto.password,
			);
		});

		it('should call generateAccessToken in jwtTokensService to generate access token for user', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);

			await authController.login(responseMock as Response, loginDto);

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
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);

			await authController.login(responseMock as Response, loginDto);

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
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);
			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);

			await authController.login(responseMock as Response, loginDto);

			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledWith(
				user?.JWTToken?.id,
				refreshToken,
			);
		});

		it('should call getById method in JWT tokens service to get created user token', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);

			await authController.login(responseMock as Response, loginDto);

			expect(jwtTokensServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.getById).toHaveBeenCalledWith(user?.JWTToken?.id);
		});

		it('should call updateUser in usersService to update user JWT token id', async (): Promise<void> => {
			const loginDto = <LoginRequestDto>{
				email: 'tony@mail.com',
				password: 'qwertyA1',
			};

			const user: UserFullDto | null = await usersServiceMock.getFullUserByEmail!(loginDto.email);
			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);
			const id: string = await jwtTokensServiceMock.saveRefreshToken!(
				user!.JWTToken!.id,
				refreshToken,
			);

			const token: JWTTokenFullDto | null = await jwtTokensServiceMock.getById!(id);

			await authController.login(responseMock as Response, loginDto);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(user?.id, { JWTToken: token });
		});
	});
});
