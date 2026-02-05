import {
	BadRequestException,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { AuthService, IUsersService, IJwtTokensService } from '@services';

import { providers } from '@modules/providers';

import { users, otpCodes, jwtTokens } from '@testMocks';

import { User, OTPCode, JWTToken } from '@entities';

import { CustomProvider } from '@enums';

import { OtpCodeDto } from '@dtos/otpCode';
import { ActivateAccountDto, ActivateAccountRequestDto } from '@dtos/auth/accountActivation';
import { UserWithJwtTokenDto, UserWithOtpCodeDto } from '@dtos/users';

import { OtpCodesHelper, TransformHelper } from '@helpers';

describe('Auth service', (): void => {
	let authService: AuthService;
	let usersService: IUsersService;
	let jwtTokensService: IJwtTokensService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,

				JwtService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_EMAIL_SERVICE,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_OTP_CODES_SERVICE,
				providers.CTF_OTP_CODES_REPOSITORY,

				providers.CTF_PASSWORD_RESET_TOKENS_SERVICE,
				providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		authService = moduleFixture.get(AuthService);
		usersService = moduleFixture.get(CustomProvider.CTF_USERS_SERVICE);
		jwtTokensService = moduleFixture.get(CustomProvider.CTF_JWT_TOKENS_SERVICE);
	});

	describe('Activate account', (): void => {
		const userMock: User = users[2];
		const otpCodeMock: OTPCode = otpCodes[2];
		const accessTokenMock: JWTToken = jwtTokens[2];
		const refreshTokenMock: JWTToken = jwtTokens[3];

		const activateAccountRequestDto: ActivateAccountRequestDto = {
			email: userMock.email,
			code: otpCodeMock.code as number,
		};

		beforeEach((): void => {
			jest
				.spyOn(usersService, 'getByEmailAndNotActiveWithOtpCode')
				.mockResolvedValue(
					plainToInstance(
						UserWithOtpCodeDto,
						{ ...userMock, otpCode: { ...otpCodeMock } as OtpCodeDto },
						{ excludeExtraneousValues: true },
					),
				);
			jest
				.spyOn(usersService, 'activateUser')
				.mockResolvedValue(
					plainToInstance(
						UserWithJwtTokenDto,
						{ ...userMock, jwtToken: refreshTokenMock },
						{ excludeExtraneousValues: true },
					),
				);

			jest
				.spyOn(jwtTokensService, 'generateAccessToken')
				.mockResolvedValue(accessTokenMock.token as string);
			jest
				.spyOn(jwtTokensService, 'generateRefreshToken')
				.mockResolvedValue(refreshTokenMock.token as string);
			jest.spyOn(jwtTokensService, 'saveRefreshToken').mockImplementation(jest.fn());

			jest.spyOn(OtpCodesHelper, 'isExpired').mockReturnValue(false);
			jest.spyOn(TransformHelper, 'toJwtTokenPayload').mockReturnValue(userMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by email and not active with otp code method from users service to find a user', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(usersService.getByEmailAndNotActiveWithOtpCode).toHaveBeenCalledTimes(1);
			expect(usersService.getByEmailAndNotActiveWithOtpCode).toHaveBeenNthCalledWith(
				1,
				activateAccountRequestDto.email,
			);
		});

		it('should throw not found exception if user was not found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByEmailAndNotActiveWithOtpCode').mockResolvedValue(null);

			await expect(authService.activateAccount(activateAccountRequestDto)).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should throw bad request exception if provided otp code is incorrect', async (): Promise<void> => {
			jest.spyOn(usersService, 'getByEmailAndNotActiveWithOtpCode').mockResolvedValue({
				...userMock,
				otpCode: { ...otpCodeMock, code: 112233 } as OtpCodeDto,
			});

			await expect(authService.activateAccount(activateAccountRequestDto)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw bad request exception if provided otp code is expired', async (): Promise<void> => {
			jest.spyOn(OtpCodesHelper, 'isExpired').mockReturnValue(true);

			await expect(authService.activateAccount(activateAccountRequestDto)).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should call activate user method from users service to activate a user account', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(usersService.activateUser).toHaveBeenCalledTimes(1);
			expect(usersService.activateUser).toHaveBeenNthCalledWith(1, userMock.id, otpCodeMock.id);
		});

		it('should throw unprocessable entity exception if user service failed to activate user account', async (): Promise<void> => {
			jest.spyOn(usersService, 'activateUser').mockResolvedValue(null);

			await expect(authService.activateAccount(activateAccountRequestDto)).rejects.toThrow(
				UnprocessableEntityException,
			);
		});

		it('should call to jwt token payload method from transform helper to transform activated user object to valid jwt payload for access token', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(TransformHelper.toJwtTokenPayload).toHaveBeenCalledTimes(2);
			expect(TransformHelper.toJwtTokenPayload).toHaveBeenNthCalledWith(
				1,
				plainToInstance(
					UserWithJwtTokenDto,
					{ ...userMock, jwtToken: refreshTokenMock },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should call to jwt token payload method from transform helper to transform activated user object to valid jwt payload for refresh token', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(TransformHelper.toJwtTokenPayload).toHaveBeenCalledTimes(2);
			expect(TransformHelper.toJwtTokenPayload).toHaveBeenNthCalledWith(
				2,
				plainToInstance(
					UserWithJwtTokenDto,
					{ ...userMock, jwtToken: refreshTokenMock },
					{ excludeExtraneousValues: true },
				),
			);
		});

		it('should call generate access token from jwt tokens service to generate access token for user', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(jwtTokensService.generateAccessToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.generateAccessToken).toHaveBeenNthCalledWith(1, userMock);
		});

		it('should call generate refresh token from jwt tokens service to generate refresh token for user', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(jwtTokensService.generateRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.generateRefreshToken).toHaveBeenNthCalledWith(1, userMock);
		});

		it('should call save refresh token method from jwt tokens service to save user refresh token to database', async (): Promise<void> => {
			await authService.activateAccount(activateAccountRequestDto);

			expect(jwtTokensService.saveRefreshToken).toHaveBeenCalledTimes(1);
			expect(jwtTokensService.saveRefreshToken).toHaveBeenNthCalledWith(
				1,
				refreshTokenMock.id,
				refreshTokenMock.token,
			);
		});

		it('should return response as instance of ActivateAccountDto', async (): Promise<void> => {
			const activateAccountDto: ActivateAccountDto =
				await authService.activateAccount(activateAccountRequestDto);

			expect(activateAccountDto).toBeInstanceOf(ActivateAccountDto);
		});

		it('should return generated access and refresh tokens', async (): Promise<void> => {
			const activateAccountDto: ActivateAccountDto =
				await authService.activateAccount(activateAccountRequestDto);

			expect(activateAccountDto.accessToken).toBe(accessTokenMock.token);
			expect(activateAccountDto.refreshToken).toBe(refreshTokenMock.token);
		});
	});
});
