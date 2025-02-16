import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { AuthController } from '@controllers/auth/auth.controller';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { IUsersService } from '@services/users/IUsersService';
import { UserFullDto } from '../../../types/dto/users/UserFull.dto';
import { AppModule } from '@modules/app.module';
import { AuthModule } from '@modules/auth.module';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { CookiesNames } from '@enums/CookiesNames.enum';

describe.skip('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const validToken: string = 'valid-jwt-token';
	const invalidToken: string = 'invalid-jwt-token';
	const validTokenId: string = '2';
	const usersMock: User[] = [...users];

	const responseMock: Partial<Response> = {
		clearCookie: jest.fn().mockImplementation((): void => {}),
	};

	const jwtTokensServiceMock: Partial<IJWTTokensService> = {
		verifyRefreshToken: jest
			.fn()
			.mockImplementation(async (token: string): Promise<JWTPayloadDto | null> => {
				if (token === validToken) {
					return <JWTPayloadDto>{
						id: 'f46845d7-90af-4c29-8e1a-221c90b33852',
						email: 'thor@mail.com',
						firstName: 'Thor',
						lastName: 'Odinson',
						nickname: 't.odinson',
					};
				}

				return null;
			}),

		deleteToken: jest.fn().mockImplementation(async (): Promise<boolean> => true),
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

	describe('POST /auth/logout', (): void => {
		beforeEach((): void => {
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.logout).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.logout).toBeInstanceOf(Function);
		});

		it('should return 204 status', async (): Promise<void> => {
			await request(app.getHttpServer())
				.post('/auth/logout')
				.set('Cookie', [`${CookiesNames.REFRESH_TOKEN}=${validToken}`])
				.expect(HttpStatus.NO_CONTENT);
		});

		it('should call verifyRefreshToken method in jwtTokens service to verify user refresh token', async (): Promise<void> => {
			await authController.logout(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.verifyRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.verifyRefreshToken).toHaveBeenCalledWith(validToken);
		});

		it('should call deleteToken method in jwtTokens service to delete user refresh token', async (): Promise<void> => {
			await authController.logout(responseMock as Response, validToken);

			expect(jwtTokensServiceMock.deleteToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.deleteToken).toHaveBeenCalledWith(validTokenId);
		});

		it('should call getFullUserByEmail method in users service to get user from db', async (): Promise<void> => {
			const userData: JWTPayloadDto | null =
				await jwtTokensServiceMock.verifyRefreshToken!(validToken);

			await authController.logout(responseMock as Response, validToken);

			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserByEmail).toHaveBeenCalledWith(userData?.email);
		});

		it('should call updateUser method in users service to set JWTTokenId to null', async (): Promise<void> => {
			const userData: JWTPayloadDto | null =
				await jwtTokensServiceMock.verifyRefreshToken!(validToken);

			await authController.logout(responseMock as Response, validToken);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(userData?.id, { JWTToken: null });
		});

		it('should not to call deleteToken and updateUser methods if refresh token invalid', async (): Promise<void> => {
			await authController.logout(responseMock as Response, invalidToken);

			expect(jwtTokensServiceMock.deleteToken).not.toHaveBeenCalled();
			expect(usersServiceMock.updateUser).not.toHaveBeenCalled();
		});

		it('should call clearCookie method to clear refresh token from cookie', async (): Promise<void> => {
			await authController.logout(responseMock as Response, validToken);

			expect(responseMock.clearCookie).toHaveBeenCalledTimes(1);
			expect(responseMock.clearCookie).toHaveBeenCalledWith(CookiesNames.REFRESH_TOKEN);
		});
	});
});
