import { Cookie } from '@Decorators/Cookie.decorator';
import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { LoginDto } from '@DTO/auth/Login.dto';
import { LoginResponseDto } from '@DTO/auth/LoginResponse.dto';
import { ResendActivationCodeDto } from '@DTO/auth/ResendActivationCode.dto';
import { ResetPasswordDto } from '@DTO/auth/ResetPassword.dto';
import { ResetPasswordConfirmationDto } from '@DTO/auth/ResetPasswordConfirmation.dto';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { JWTTokenFullDto } from '@DTO/JWTTokens/JWTTokenFull.dto';

import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { CookiesNames } from '@Enums/CookiesNames';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { IAuthController } from '@Interfaces/auth/IAuthController';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IEmailService } from '@Interfaces/emails/IEmailService';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { IOTPCodesService } from '@Interfaces/OTPCodes/IOTPCodesService';

import { IUsersService } from '@Interfaces/users/IUsersService';
import {
	Body,
	ConflictException,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	Res,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';

import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';
import { Response } from 'express';

@Controller('auth')
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.I_AUTH_SERVICE)
		private readonly _authService: IAuthService,

		@Inject(CustomProviders.I_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,

		@Inject(CustomProviders.I_OTP_CODES_SERVICE)
		private readonly _otpCodesService: IOTPCodesService,

		@Inject(CustomProviders.I_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJWTTokensService,
	) {}

	@Post('/signup')
	@HttpCode(HttpStatus.CREATED)
	public async signup(@Body() signupUserDTO: SignupUserDto): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<UserShortDto> = new SuccessfulResponseResult(
			HttpStatus.CREATED,
			ResponseStatus.SUCCESS,
		);

		const userByEmail: UserShortDto | null = await this._usersService.getByEmail(
			signupUserDTO.email,
		);

		if (userByEmail) {
			throw new ConflictException(['This email is already taken|email']);
		}

		const userByNickname: UserShortDto | null = await this._usersService.getByNickname(
			signupUserDTO.nickname,
		);

		if (userByNickname) {
			throw new ConflictException(['This nickname is already taken|nickname']);
		}

		const createdUser: UserShortDto | null = await this._usersService.createUser(signupUserDTO);

		if (!createdUser) {
			throw new UnprocessableEntityException(['Failed to create user. Please try again|email']);
		}

		const userOTPCode: OTPCodeResponseDto | null = await this._usersService.getUserOTPCode(
			createdUser.OTPCodeId,
		);

		if (!userOTPCode || !userOTPCode.code) {
			throw new UnprocessableEntityException(['Failed to create user. Please try again|email']);
		}

		await this._emailService.sendActivationEmail(createdUser.email, userOTPCode.code);

		responseResult.data = [createdUser];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/activate-account')
	@HttpCode(HttpStatus.OK)
	public async activateAccount(
		@Body() accountActivationDto: AccountActivationDto,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		const isActivated: boolean = await this._authService.activateAccount(accountActivationDto);

		if (!isActivated) {
			throw new UnprocessableEntityException([
				'Invalid or expired code. Please check the entered code or request a new one|otpCode',
			]);
		}

		await this._otpCodesService.updateOTPCode(accountActivationDto.OTPCodeId, {
			code: null,
			expiresAt: null,
		});

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/resend-activation-code')
	@HttpCode(HttpStatus.OK)
	public async resendActivationCode(
		@Body() resendActivationCodeDto: ResendActivationCodeDto,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		const user: UserFullDto | null = await this._usersService.getFullUserByEmail(
			resendActivationCodeDto.email,
		);

		if (!user) {
			throw new NotFoundException(['User with this email does not exist|email']);
		}

		if (user.isActivated) {
			throw new UnprocessableEntityException(['This account is already activated|email']);
		}

		await this._otpCodesService.createNewOTPCode(user.OTPCodeId);

		const otpCode: OTPCodeResponseDto | null = await this._usersService.getUserOTPCode(
			user.OTPCodeId,
		);

		if (!otpCode || !otpCode.code) {
			throw new UnprocessableEntityException([
				'Failed to create new OTP code. Please try again|email',
			]);
		}

		await this._emailService.sendActivationEmail(resendActivationCodeDto.email, otpCode.code);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/reset-password')
	@HttpCode(HttpStatus.OK)
	public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		const user: UserShortDto | null = await this._usersService.getByEmail(resetPasswordDto.email);

		if (!user) {
			throw new NotFoundException(['User with this email does not exist|email']);
		}

		const token: string | null = await this._usersService.createPasswordResetToken(user.id);

		if (!token) {
			throw new UnprocessableEntityException(['Failed to reset password. Please try again|email']);
		}

		await this._emailService.sendResetPasswordEmail(user.email, user.firstName, token);

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post(`/reset-password/:resetToken`)
	@HttpCode(HttpStatus.OK)
	public async resetPasswordConfirmation(
		@Body() resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
		@Param('resetToken', ParseUUIDPipe) resetToken: string,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.OK,
			ResponseStatus.SUCCESS,
		);

		const user: UserFullDto | null = await this._usersService.getByResetPasswordToken(resetToken);

		if (!user) {
			throw new NotFoundException(['User related to this token not found|reset-token']);
		}

		const isUpdated: boolean = await this._usersService.updateUser(user.id, {
			password: resetPasswordConfirmationDto.password,
		});

		if (!isUpdated) {
			throw new UnprocessableEntityException([
				'Failed to update password. Please try again|password',
			]);
		}

		responseResult.data = [];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Res({ passthrough: true }) response: Response,
		@Body() loginDto: LoginDto,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<LoginResponseDto> =
			new SuccessfulResponseResult<LoginResponseDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		const user: UserFullDto | null = await this._usersService.getFullUserByEmail(loginDto.email);

		if (!user) {
			throw new UnprocessableEntityException(['Invalid email or password|password']);
		}

		const isPasswordValid: boolean = await this._authService.validatePassword(
			loginDto.password,
			user.password,
		);

		if (!isPasswordValid) {
			throw new UnprocessableEntityException(['Invalid email or password|password']);
		}

		const accessToken: string = await this._jwtTokensService.generateAccessToken({
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			nickname: user.nickname,
		});

		const refreshToken: string = await this._jwtTokensService.generateRefreshToken({
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			nickname: user.nickname,
		});

		const savedTokenId: string = await this._jwtTokensService.saveRefreshToken(
			user.JWTTokenId,
			refreshToken,
		);

		const isTokenIdUpdated: boolean = await this._usersService.updateUser(user.id, {
			JWTTokenId: savedTokenId,
		});

		if (!isTokenIdUpdated) {
			throw new UnprocessableEntityException(['Failed to login. Please try again|password']);
		}

		response.cookie(CookiesNames.REFRESH_TOKEN, refreshToken, {
			maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 0,
			secure: true,
			sameSite: 'strict',
			httpOnly: true,
		});

		responseResult.data = [{ accessToken }];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}

	@Post('/logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async logout(
		@Res({ passthrough: true }) response: Response,
		@Cookie(CookiesNames.REFRESH_TOKEN) refreshToken: string,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<null> = new SuccessfulResponseResult<null>(
			HttpStatus.NO_CONTENT,
			ResponseStatus.SUCCESS,
		);

		const userData: JWTPayloadDto | null =
			await this._jwtTokensService.verifyRefreshToken(refreshToken);

		if (userData) {
			const fullUserData: UserFullDto | null = await this._usersService.getFullUserByEmail(
				userData.email,
			);

			if (!fullUserData || !fullUserData.JWTTokenId) {
				throw new UnprocessableEntityException(['Failed to log out. Please try again|email']);
			}

			const isCookieDeleted: boolean = await this._jwtTokensService.deleteToken(
				fullUserData.JWTTokenId,
			);

			const isUserUpdated: boolean = await this._usersService.updateUser(userData.id, {
				JWTTokenId: null,
			});

			if (!isCookieDeleted || !isUserUpdated) {
				throw new UnprocessableEntityException(['Failed to log out. Please try again|email']);
			}
		}

		response.clearCookie(CookiesNames.REFRESH_TOKEN);

		return responseResult;
	}

	@Post('/refresh')
	@HttpCode(HttpStatus.OK)
	public async refresh(
		@Res({ passthrough: true }) response: Response,
		@Cookie(CookiesNames.REFRESH_TOKEN) refreshToken: string,
	): Promise<ResponseResult> {
		const responseResult: SuccessfulResponseResult<LoginResponseDto> =
			new SuccessfulResponseResult<LoginResponseDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		const userData: JWTPayloadDto | null =
			await this._jwtTokensService.verifyRefreshToken(refreshToken);

		if (!userData) {
			throw new UnauthorizedException(['Please, login to perform this action|email']);
		}

		const user: UserFullDto | null = await this._usersService.getFullUserByEmail(userData.email);

		if (!user || !user.JWTTokenId) {
			throw new UnauthorizedException(['Please, login to perform this action|email']);
		}

		const token: JWTTokenFullDto | null = await this._jwtTokensService.getById(user.JWTTokenId);

		if (!token) {
			throw new UnauthorizedException(['Please, login to perform this action|email']);
		}

		const newAccessToken: string = await this._jwtTokensService.generateAccessToken({
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			nickname: user.nickname,
		});

		const newRefreshToken: string = await this._jwtTokensService.generateRefreshToken({
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			nickname: user.nickname,
		});

		const savedTokenId: string = await this._jwtTokensService.saveRefreshToken(
			user.JWTTokenId,
			newRefreshToken,
		);

		const isTokenIdUpdated: boolean = await this._usersService.updateUser(user.id, {
			JWTTokenId: savedTokenId,
		});

		if (!isTokenIdUpdated) {
			throw new UnprocessableEntityException([
				'Failed to refresh access token. Please try again|email',
			]);
		}

		response.cookie(CookiesNames.REFRESH_TOKEN, newRefreshToken, {
			maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) || 0,
			secure: true,
			sameSite: 'strict',
			httpOnly: true,
		});

		responseResult.data = [{ accessToken: newAccessToken }];
		responseResult.dataLength = responseResult.data.length;

		return responseResult;
	}
}
