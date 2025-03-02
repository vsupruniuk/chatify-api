import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
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
import { IAuthController } from './IAuthController';
import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { PasswordHashingPipe } from '@pipes/passwordHashing.pipe';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IAuthService } from '@services/auth/IAuthService';
import { ActivateAccountRequestDto } from '@dtos/auth/accountActivation/ActivateAccountRequest.dto';
import { Response } from 'express';
import { ActivateAccountResponseDto } from '@dtos/auth/accountActivation/ActivateAccountResponse.dto';
import { ActivateAccountDto } from '@dtos/auth/accountActivation/ActivateAccount.dto';
import { ResponseHelper } from '@helpers/response.helper';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode/ResendActivationCodeRequest.dto';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword/ResetPasswordRequest.dto';
import { ResetPasswordConfirmationRequestDto } from '@dtos/auth/resetPasswordConfirmation/ResetPasswordConfirmationRequest.dto';
import { LoginRequestDto } from '@dtos/auth/login/LoginRequest.dto';
import { LoginResponseDto } from '@dtos/auth/login/LoginResponse.dto';
import { LoginDto } from '@dtos/auth/login/Login.dto';
import { Cookie } from '@decorators/data/Cookie.decorator';
import { CookiesNames } from '@enums/CookiesNames.enum';

@Controller('auth')
@UseInterceptors(ResponseTransformInterceptor)
export class AuthController implements IAuthController {
	constructor(
		@Inject(CustomProviders.CTF_AUTH_SERVICE)
		private readonly _authService: IAuthService,
	) {}

	@Post('signup')
	public async signup(
		@Body(PasswordHashingPipe) signupRequestDto: SignupRequestDto,
	): Promise<void> {
		await this._authService.registerUser(signupRequestDto);
	}

	@Patch('activate-account')
	public async activateAccount(
		@Res({ passthrough: true }) response: Response,
		@Body() activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountResponseDto> {
		const activateAccountDto: ActivateAccountDto =
			await this._authService.activateAccount(activateAccountRequestDto);

		ResponseHelper.setRefreshTokenCookie(response, activateAccountDto.refreshToken);

		return { accessToken: activateAccountDto.accessToken };
	}

	@Patch('resend-activation-code')
	public async resendActivationCode(
		@Body() resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void> {
		await this._authService.resendActivationCode(resendActivationCodeRequestDto);
	}

	@Patch('reset-password')
	public async resetPassword(
		@Body() resetPasswordRequestDto: ResetPasswordRequestDto,
	): Promise<void> {
		await this._authService.resetPassword(resetPasswordRequestDto);
	}

	@Patch('reset-password/:passwordResetToken')
	public async resetPasswordConfirmation(
		@Body(PasswordHashingPipe)
		resetPasswordConfirmationRequestDto: ResetPasswordConfirmationRequestDto,

		@Param('passwordResetToken', ParseUUIDPipe) passwordResetToken: string,
	): Promise<void> {
		await this._authService.confirmResetPassword(
			resetPasswordConfirmationRequestDto.password,
			passwordResetToken,
		);
	}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	public async login(
		@Res({ passthrough: true }) response: Response,
		@Body() loginRequestDto: LoginRequestDto,
	): Promise<LoginResponseDto> {
		const loginDto: LoginDto = await this._authService.login(loginRequestDto);

		ResponseHelper.setRefreshTokenCookie(response, loginDto.refreshToken);

		return { accessToken: loginDto.accessToken };
	}

	@Patch('logout')
	@HttpCode(HttpStatus.NO_CONTENT)
	public async logout(
		@Res({ passthrough: true }) response: Response,

		@Cookie(CookiesNames.REFRESH_TOKEN) refreshToken: string,
	): Promise<void> {
		await this._authService.logout(refreshToken);

		response.clearCookie(CookiesNames.REFRESH_TOKEN);
	}

	@Patch('refresh')
	public async refresh(
		@Res({ passthrough: true }) response: Response,

		@Cookie(CookiesNames.REFRESH_TOKEN) refreshToken: string,
	): Promise<LoginResponseDto> {
		const loginDto: LoginDto = await this._authService.refresh(refreshToken);

		ResponseHelper.setRefreshTokenCookie(response, loginDto.refreshToken);

		return { accessToken: loginDto.accessToken };
	}
}
