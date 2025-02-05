import { AuthController } from '@Controllers/auth.controller';
import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { LoginResponseDto } from '@DTO/auth/LoginResponse.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { JWTToken } from '@Entities/JWTToken.entity';
import { OTPCode } from '@Entities/OTPCode.entity';
import { User } from '@Entities/User.entity';
import { CookiesNames } from '@Enums/CookiesNames.enum';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Headers } from '@Enums/Headers.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { IOTPCodesService } from '@Interfaces/OTPCodes/IOTPCodesService';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppModule } from '@Modules/app.module';
import { AuthModule } from '@Modules/auth.module';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { jwtTokens } from '@TestMocks/JWTToken/jwtTokens';
import { otpCodes } from '@TestMocks/OTPCode/otpCodes';
import { users } from '@TestMocks/User/users';
import { plainToInstance } from 'class-transformer';
import { Response } from 'express';
import * as request from 'supertest';

describe('AuthController', (): void => {
	let app: INestApplication;
	let authController: AuthController;

	const otpCodesMock: OTPCode[] = [...otpCodes];
	const jwtTokensMock: JWTToken[] = [...jwtTokens];
	let usersMock: User[] = [...users];
	const responseMock: Partial<Response> = {
		cookie: jest.fn(),
	};

	const existingOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd099';
	const notExistingOTPCodeId: string = '1662043c-4d4b-4424-ac31-45189dedd000';
	const existingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33852';
	const notExistingUserId: string = 'f46845d7-90af-4c29-8e1a-227c90b33333';
	const existingTokenId: string = '1';
	const newTokenId: string = '5';

	const authServiceMock: Partial<IAuthService> = {
		activateAccount: jest
			.fn()
			.mockImplementation(async (accountActivationDto: AccountActivationDto): Promise<boolean> => {
				const otpCode: OTPCode | undefined = otpCodesMock.find(
					(code: OTPCode) => code.id === accountActivationDto.OTPCodeId,
				);

				if (!otpCode) {
					return false;
				}

				const isExpired = OTPCodesHelper.isExpired(otpCode);

				if (isExpired) {
					return false;
				}

				if (accountActivationDto.code !== otpCode.code) {
					return false;
				}

				const userIndex = usersMock.findIndex((user: User) => user.id === accountActivationDto.id);

				if (userIndex < 0) {
					return false;
				} else {
					usersMock[userIndex].isActivated = true;

					return true;
				}
			}),
	};

	const jwtTokensServiceMock: Partial<IJWTTokensService> = {
		getById: jest.fn().mockImplementation(async (id: string): Promise<JWTTokenFullDto | null> => {
			const token: JWTToken | null =
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
				async (id): Promise<string> => (id === existingTokenId ? existingTokenId : newTokenId),
			),
	};

	const usersServiceMock: Partial<IUsersService> = {
		getFullUserById: jest
			.fn()
			.mockImplementation(async (id: string): Promise<UserFullDto | null> => {
				const user: User | null = usersMock.find((user: User) => user.id === id) || null;

				return user ? plainToInstance(UserFullDto, user, { excludeExtraneousValues: true }) : null;
			}),

		updateUser: jest.fn().mockImplementation(async (): Promise<boolean> => true),
	};

	const otpCodesServiceMock: Partial<IOTPCodesService> = {
		deactivateUserOTPCode: jest
			.fn()
			.mockImplementation(async (userOTPCodeId: string): Promise<boolean> => {
				return otpCodesMock.some((code: OTPCode) => code.id === userOTPCodeId);
			}),
	};

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
		})
			.overrideProvider(CustomProviders.CTF_AUTH_SERVICE)
			.useValue(authServiceMock)
			.overrideProvider(CustomProviders.CTF_OTP_CODES_SERVICE)
			.useValue(otpCodesServiceMock)
			.overrideProvider(CustomProviders.CTF_JWT_TOKENS_SERVICE)
			.useValue(jwtTokensServiceMock)
			.overrideProvider(CustomProviders.CTF_USERS_SERVICE)
			.useValue(usersServiceMock)
			.compile();

		app = moduleFixture.createNestApplication();
		authController = moduleFixture.get<AuthController>(AuthController);

		app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: false }));

		await app.init();
	});

	afterAll(async (): Promise<void> => {
		await app.close();
	});

	describe('POST /auth/activate-account', (): void => {
		beforeEach((): void => {
			usersMock = [...users];

			jest.useFakeTimers();
		});

		afterEach((): void => {
			jest.clearAllMocks();
			jest.useRealTimers();
		});

		it('should be defined', (): void => {
			expect(authController.activateAccount).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.activateAccount).toBeInstanceOf(Function);
		});

		it('should return 400 status if id format is incorrect', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: 'uuid-4',
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if OTPCodeId format is incorrect', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: 'uuid-4',
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code is not a number', async (): Promise<void> => {
			const accountActivationDto = {
				id: existingUserId,
				code: 'string',
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code less then 100 000 (not a 6-digit number)', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 98765,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 400 status if code greater then 999 999 (not a 6-digit number)', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 1234567,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if OTPCodeId does not exist', async (): Promise<void> => {
			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 123456,
				OTPCodeId: notExistingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if code is expired', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:35:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 123456,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if code is wrong', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 444444,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 422 status if user id does not exist', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: notExistingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.BAD_REQUEST);
		});

		it('should return 200 status and correct response if all data is valid', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const expectedResponse = <SuccessfulResponseResult<LoginResponseDto>>{
				code: HttpStatus.OK,
				status: ResponseStatus.SUCCESS,
				data: [{ accessToken: 'jwt-access-token' }],
				dataLength: 1,
			};

			request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.OK)
				.expect(expectedResponse);
		});

		it('should set refresh token to cookies', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await request(app.getHttpServer())
				.post('/auth/activate-account')
				.send(accountActivationDto)
				.expect(HttpStatus.OK)
				.expect(Headers.SET_COOKIE, RegExp(CookiesNames.REFRESH_TOKEN));
		});

		it('should call cookie method to set refreshToken to cookie', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const token: string = await jwtTokensServiceMock.generateRefreshToken!({} as JWTPayloadDto);

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(responseMock.cookie).toHaveBeenCalledTimes(1);
			expect(responseMock.cookie).toHaveBeenCalledWith(CookiesNames.REFRESH_TOKEN, token, {
				maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
				secure: true,
				sameSite: 'strict',
				httpOnly: true,
			});
		});

		it('should call activateAccount method in auth controller to handle account activation', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(authServiceMock.activateAccount).toHaveBeenCalledTimes(1);
			expect(authServiceMock.activateAccount).toHaveBeenCalledWith(accountActivationDto);
		});

		it('should call deactivateUserOTPCode method in otpCodes service to deactivate opt code after account activation', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(otpCodesServiceMock.deactivateUserOTPCode).toHaveBeenCalledTimes(1);
			expect(otpCodesServiceMock.deactivateUserOTPCode).toHaveBeenCalledWith(existingOTPCodeId);
		});

		it('should call generateAccessToken in jwtTokensService to generate access token for user', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const user: User | null = usersMock.find((user: User) => user.id === existingUserId) || null;

			await authController.activateAccount(responseMock as Response, accountActivationDto);

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
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const user: User | null = usersMock.find((user: User) => user.id === existingUserId) || null;

			await authController.activateAccount(responseMock as Response, accountActivationDto);

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
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const user: User | null = usersMock.find((user: User) => user.id === existingUserId) || null;

			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.saveRefreshToken).toHaveBeenCalledWith(
				user?.JWTToken?.id,
				refreshToken,
			);
		});

		it('should call getFullUserById to get user by its id', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(usersServiceMock.getFullUserById).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.getFullUserById).toHaveBeenCalledWith(existingUserId);
		});

		it('should call getGyId method in JWT tokens service to get created user JWT token', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const user: User | null = usersMock.find((user: User) => user.id === existingUserId) || null;

			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);

			const id: string = await jwtTokensServiceMock.saveRefreshToken!(
				user!.JWTToken!.id,
				refreshToken,
			);

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(jwtTokensServiceMock.getById).toHaveBeenCalledTimes(1);
			expect(jwtTokensServiceMock.getById).toHaveBeenCalledWith(id);
		});

		it('should call updateUser in usersService to update user JWT token id', async (): Promise<void> => {
			jest.setSystemTime(new Date('2023-11-24 18:25:00'));

			const accountActivationDto = <AccountActivationDto>{
				id: existingUserId,
				code: 111111,
				OTPCodeId: existingOTPCodeId,
			};

			const user: User | null = usersMock.find((user: User) => user.id === existingUserId) || null;

			const refreshToken: string = await jwtTokensServiceMock.generateRefreshToken!(
				plainToInstance(JWTPayloadDto, user, { excludeExtraneousValues: true }),
			);

			const id: string = await jwtTokensServiceMock.saveRefreshToken!(
				user!.JWTToken!.id,
				refreshToken,
			);

			const token: JWTTokenFullDto | null = await jwtTokensServiceMock.getById!(id);

			await authController.activateAccount(responseMock as Response, accountActivationDto);

			expect(usersServiceMock.updateUser).toHaveBeenCalledTimes(1);
			expect(usersServiceMock.updateUser).toHaveBeenCalledWith(user?.id, { JWTToken: token });
		});
	});
});
