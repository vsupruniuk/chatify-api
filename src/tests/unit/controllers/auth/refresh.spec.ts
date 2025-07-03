import { AuthController } from '@controllers/auth/auth.controller';
import { IAuthService } from '@services/auth/IAuthService';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { Response } from 'express';
import { ResponseHelper } from '@helpers/response.helper';
import { LoginDto } from '@dtos/auth/login/Login.dto';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';

describe('Auth controller', (): void => {
	let authController: AuthController;
	let authService: IAuthService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AuthController,

				providers.CTF_AUTH_SERVICE,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_OTP_CODES_SERVICE,
				providers.CTF_OTP_CODES_REPOSITORY,

				providers.CTF_PASSWORD_RESET_TOKENS_SERVICE,
				providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,

				providers.CTF_EMAIL_SERVICE,

				JwtService,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		authController = moduleFixture.get(AuthController);
		authService = moduleFixture.get(CustomProviders.CTF_AUTH_SERVICE);
	});

	describe('Refresh', (): void => {
		const loginDtoMock: LoginDto = {
			accessToken: 'accessToken',
			refreshToken: 'refreshToken',
		};

		const response: Response = {} as Response;
		const refreshToken: string = 'refreshToken';

		beforeEach((): void => {
			jest.spyOn(authService, 'refresh').mockResolvedValue(loginDtoMock);
			jest.spyOn(ResponseHelper, 'setRefreshTokenCookie').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(authController.refresh).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(authController.refresh).toBeInstanceOf(Function);
		});

		it('should call refresh method from auth service to update user access and refresh tokens', async (): Promise<void> => {
			await authController.refresh(response, refreshToken);

			expect(authService.refresh).toHaveBeenCalledTimes(1);
			expect(authService.refresh).toHaveBeenNthCalledWith(1, refreshToken);
		});

		it('should call set refresh token cookie method from response helper to set cookie for user', async (): Promise<void> => {
			await authController.refresh(response, refreshToken);

			expect(ResponseHelper.setRefreshTokenCookie).toHaveBeenCalledTimes(1);
			expect(ResponseHelper.setRefreshTokenCookie).toHaveBeenNthCalledWith(
				1,
				response,
				loginDtoMock.refreshToken,
			);
		});

		it('should return access token for user', async (): Promise<void> => {
			const loginResponseDto: LoginResponseDto = await authController.refresh(
				response,
				refreshToken,
			);

			expect(loginResponseDto).toEqual({
				accessToken: loginDtoMock.accessToken,
			});
		});
	});
});
