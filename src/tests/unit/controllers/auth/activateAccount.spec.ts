import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { Response } from 'express';

import { AuthController } from '@controllers';

import { IAuthService } from '@services';

import { providers } from '@modules/providers';

import { CustomProviders } from '@enums';

import { ResponseHelper } from '@helpers';

import {
	ActivateAccountRequestDto,
	ActivateAccountDto,
	ActivateAccountResponseDto,
} from '@dtos/auth/accountActivation';

describe('Auth controller', (): void => {
	let authController: AuthController;
	let authService: IAuthService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
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

	describe('Activate account', (): void => {
		const activateAccountDtoMock: ActivateAccountDto = {
			accessToken: 'accessToken',
			refreshToken: 'refreshToken',
		};

		const response: Response = {} as Response;
		const activateAccountRequestDto: ActivateAccountRequestDto = {
			email: 't.stark@avengers.com',
			code: 123321,
		};

		beforeEach((): void => {
			jest.spyOn(authService, 'activateAccount').mockResolvedValue(activateAccountDtoMock);
			jest.spyOn(ResponseHelper, 'setRefreshTokenCookie').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should call activate account method from auth service to activate user account', async (): Promise<void> => {
			await authController.activateAccount(response, activateAccountRequestDto);

			expect(authService.activateAccount).toHaveBeenCalledTimes(1);
			expect(authService.activateAccount).toHaveBeenNthCalledWith(1, activateAccountRequestDto);
		});

		it('should call set refresh token cookie method from response helper to set cookie for user', async (): Promise<void> => {
			await authController.activateAccount(response, activateAccountRequestDto);

			expect(ResponseHelper.setRefreshTokenCookie).toHaveBeenCalledTimes(1);
			expect(ResponseHelper.setRefreshTokenCookie).toHaveBeenNthCalledWith(
				1,
				response,
				activateAccountDtoMock.refreshToken,
			);
		});

		it('should return access token for user', async (): Promise<void> => {
			const activateAccountResponseDto: ActivateAccountResponseDto =
				await authController.activateAccount(response, activateAccountRequestDto);

			expect(activateAccountResponseDto).toEqual({
				accessToken: activateAccountDtoMock.accessToken,
			});
		});
	});
});
