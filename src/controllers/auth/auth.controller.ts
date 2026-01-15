import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Res,
	UseInterceptors,
} from '@nestjs/common';

import { Response } from 'express';

import { ResponseTransformInterceptor } from '@interceptors';

import { IAuthController } from '@controllers';

import { SignupRequestDto } from '@dtos/auth/signup';
import {
	ActivateAccountResponseDto,
	ActivateAccountRequestDto,
	ActivateAccountDto,
} from '@dtos/auth/accountActivation';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword';
import { ResetPasswordConfirmationRequestDto } from '@dtos/auth/resetPasswordConfirmation';
import { LoginRequestDto, LoginResponseDto, LoginDto } from '@dtos/auth/login';

import { PasswordHashingPipe } from '@pipes';

import { CustomProvider, CookiesName, Route, PathParam } from '@enums';

import { IAuthService } from '@services';

import { ResponseHelper } from '@helpers';

import { Cookie } from '@decorators/data';

@Controller(Route.AUTH)
@UseInterceptors(ResponseTransformInterceptor)
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProvider.CTF_AUTH_SERVICE)
		private readonly _authService: IAuthService,
	) {}

	@Post(Route.SIGNUP)
	public async signup(
		@Body(PasswordHashingPipe) signupRequestDto: SignupRequestDto,
	): Promise<void> {
		await this._authService.registerUser(signupRequestDto);
	}

	@Patch(Route.ACTIVATE_ACCOUNT)
	public async activateAccount(
		@Res({ passthrough: true }) response: Response,
		@Body() activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountResponseDto> {
		const activateAccountDto: ActivateAccountDto =
			await this._authService.activateAccount(activateAccountRequestDto);

		ResponseHelper.setRefreshTokenCookie(response, activateAccountDto.refreshToken);

		return { accessToken: activateAccountDto.accessToken };
	}

	@Patch(Route.RESEND_ACTIVATION_CODE)
	public async resendActivationCode(
		@Body() resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void> {
		await this._authService.resendActivationCode(resendActivationCodeRequestDto);
	}

	@Patch(Route.RESET_PASSWORD)
	public async resetPassword(
		@Body() resetPasswordRequestDto: ResetPasswordRequestDto,
	): Promise<void> {
		await this._authService.resetPassword(resetPasswordRequestDto);
	}

	@Patch(`${Route.RESET_PASSWORD}/:${PathParam.PASSWORD_RESET_TOKEN}`)
	public async resetPasswordConfirmation(
		@Body(PasswordHashingPipe)
		resetPasswordConfirmationRequestDto: ResetPasswordConfirmationRequestDto,

		@Param(PathParam.PASSWORD_RESET_TOKEN, ParseUUIDPipe) passwordResetToken: string,
	): Promise<void> {
		await this._authService.confirmResetPassword(
			resetPasswordConfirmationRequestDto.password,
			passwordResetToken,
		);
	}

	@Post(Route.LOGIN)
	@HttpCode(HttpStatus.OK)
	public async login(
		@Res({ passthrough: true }) response: Response,
		@Body() loginRequestDto: LoginRequestDto,
	): Promise<LoginResponseDto> {
		const loginDto: LoginDto = await this._authService.login(loginRequestDto);

		ResponseHelper.setRefreshTokenCookie(response, loginDto.refreshToken);

		return { accessToken: loginDto.accessToken };
	}

	@Patch(Route.LOGOUT)
	@HttpCode(HttpStatus.NO_CONTENT)
	public async logout(
		@Res({ passthrough: true }) response: Response,
		@Cookie(CookiesName.REFRESH_TOKEN) refreshToken: string,
	): Promise<void> {
		await this._authService.logout(refreshToken);

		response.clearCookie(CookiesName.REFRESH_TOKEN);
	}

	@Patch(Route.REFRESH)
	public async refresh(
		@Res({ passthrough: true }) response: Response,
		@Cookie(CookiesName.REFRESH_TOKEN) refreshToken: string,
	): Promise<LoginResponseDto> {
		const loginDto: LoginDto = await this._authService.refresh(refreshToken);

		ResponseHelper.setRefreshTokenCookie(response, loginDto.refreshToken);

		return { accessToken: loginDto.accessToken };
	}
}
