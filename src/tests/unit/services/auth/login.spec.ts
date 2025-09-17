import { AuthService } from '@services/auth/auth.service';
import { IUsersService } from '@services/users/IUsersService';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { JWTToken } from '@entities/JWTToken.entity';
import { jwtTokens } from '@testMocks/JWTToken/jwtTokens';
import { LoginRequestDto } from '@dtos/auth/login/LoginRequest.dto';
import { PasswordHelper } from '@helpers/password.helper';
import { TransformHelper } from '@helpers/transform.helper';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LoginDto } from '@dtos/auth/login/Login.dto';

describe('Auth service', (): void => {
	let authService: AuthService;
	let usersService: IUsersService;
	let jwtTokensService: IJWTTokensService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,

				JwtService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_EMAIL_SERVICE,
				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_OTP_CODES_SERVICE,
				providers.CTF_PASSWORD_RESET_TOKENS_SERVICE,

				providers.CTF_USERS_REPOSITORY,
				providers.CTF_JWT_TOKENS_REPOSITORY,
				providers.CTF_OTP_CODES_REPOSITORY,
				providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		authService = moduleFixture.get(AuthService);
		usersService = moduleFixture.get(CustomProviders.CTF_USERS_SERVICE);
		jwtTokensService = moduleFixture.get(CustomProviders.CTF_JWT_TOKENS_SERVICE);
	});

	describe('Login', (): void => {
		const userMock: User = users[2];
		const accessTokenMock: JWTToken = jwtTokens[2];
		const refreshTokenMock: JWTToken = jwtTokens[2];

		const loginRequestDto: LoginRequestDto = { email: userMock.email, password: userMock.password };

		beforeEach((): void => {
			jest
				.spyOn(usersService, 'getFullUserWithJwtTokenByEmail')
				.mockResolvedValue({ ...userMock, jwtToken: { ...refreshTokenMock } });
			jest
				.spyOn(jwtTokensService, 'generateAccessToken')
				.mockResolvedValue(accessTokenMock.token as string);
			jest
				.spyOn(jwtTokensService, 'generateRefreshToken')
				.mockResolvedValue(refreshTokenMock.token as string);
			jest.spyOn(jwtTokensService, 'saveRefreshToken').mockImplementation(jest.fn());
			jest.spyOn(PasswordHelper, 'validatePassword').mockResolvedValue(true);
			jest.spyOn(TransformHelper, 'toJwtTokenPayload').mockReturnValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get full user with jwt token by email method from users service to get a user', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(usersService.getFullUserWithJwtTokenByEmail).toHaveBeenCalledTimes(1);
			expect(usersService.getFullUserWithJwtTokenByEmail).toHaveBeenNthCalledWith(
				1,
				loginRequestDto.email,
			);
		});

		it('should throw not found exception if users service failed to find a user', async (): Promise<void> => {
			jest.spyOn(usersService, 'getFullUserWithJwtTokenByEmail').mockResolvedValue(null);

			await expect(authService.login(loginRequestDto)).rejects.toThrow(NotFoundException);
		});

		it('should call validate password from password helper to check if user password is valid', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(PasswordHelper.validatePassword).toHaveBeenCalledTimes(1);
			expect(PasswordHelper.validatePassword).toHaveBeenNthCalledWith(
				1,
				loginRequestDto.password,
				userMock.password,
			);
		});

		it('should throw bad request exception if password is invalid', async (): Promise<void> => {
			jest.spyOn(PasswordHelper, 'validatePassword').mockResolvedValue(false);

			await expect(authService.login(loginRequestDto)).rejects.toThrow(BadRequestException);
		});

		it('should call to jwt token payload method from transform helper to transform user data for generating access token', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(TransformHelper.toJwtTokenPayload).toHaveBeenCalledTimes(2);
			expect(TransformHelper.toJwtTokenPayload).toHaveBeenNthCalledWith(1, {
				...userMock,
				jwtToken: refreshTokenMock,
			});
		});

		it('should call to jwt token payload method from transform helper to transform user data for generating refresh token', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(TransformHelper.toJwtTokenPayload).toHaveBeenCalledTimes(2);
			expect(TransformHelper.toJwtTokenPayload).toHaveBeenNthCalledWith(2, {
				...userMock,
				jwtToken: refreshTokenMock,
			});
		});

		it('should call generate access token method from jwt tokens service to generate user access token', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(jwtTokensService.generateAccessToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.generateAccessToken).toHaveBeenNthCalledWith(1, userMock);
		});

		it('should call generate refresh token method from jwt tokens service to generate user refresh token', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(jwtTokensService.generateRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.generateRefreshToken).toHaveBeenNthCalledWith(1, userMock);
		});

		it('should call save refresh token method from jwt tokens service to save user refresh token to the database', async (): Promise<void> => {
			await authService.login(loginRequestDto);

			expect(jwtTokensService.saveRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.saveRefreshToken).toHaveBeenNthCalledWith(
				1,
				refreshTokenMock.id,
				refreshTokenMock.token,
			);
		});

		it('should return response as instance of LoginDto', async (): Promise<void> => {
			const loginDto: LoginDto = await authService.login(loginRequestDto);

			expect(loginDto).toBeInstanceOf(LoginDto);
		});

		it('should return generated access and refresh tokens', async (): Promise<void> => {
			const loginDto: LoginDto = await authService.login(loginRequestDto);

			expect(loginDto.accessToken).toBe(accessTokenMock.token);
			expect(loginDto.refreshToken).toBe(refreshTokenMock.token);
		});
	});
});
