import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
import { Body, Controller, Inject, Patch, Post, Res, UseInterceptors } from '@nestjs/common';
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

	// // TODO check if needed
	// @Post('reset-password')
	// @HttpCode(HttpStatus.OK)
	// public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
	// 	const user: UserFullDto | null = await this._usersService.getFullUserByEmail(
	// 		resetPasswordDto.email,
	// 	);
	//
	// 	if (!user) {
	// 		throw new NotFoundException(['User with this email does not exist|email']);
	// 	}
	//
	// 	const token: string | null = await this._passwordResetTokensService.saveToken(
	// 		user.id,
	// 		user.passwordResetToken?.id || null,
	// 	);
	//
	// 	if (!token) {
	// 		throw new UnprocessableEntityException(['Failed to reset password. Please try again']);
	// 	}
	//
	// 	await this._emailService.sendResetPasswordEmail(user.email, user.firstName, token);
	// }
	//
	// // TODO check if needed
	// @Post(`reset-password/:resetToken`)
	// @HttpCode(HttpStatus.OK)
	// public async resetPasswordConfirmation(
	// 	@Body() resetPasswordConfirmationDto: ResetPasswordConfirmationDto,
	// 	@Param('resetToken', ParseUUIDPipe) resetToken: string,
	// ): Promise<void> {
	// 	const user: UserFullDto | null = await this._usersService.getByResetPasswordToken(resetToken);
	//
	// 	if (!user || !user.passwordResetToken) {
	// 		throw new NotFoundException(['User related to this token not found']);
	// 	}
	//
	// 	const isUpdated: boolean = await this._usersService.updateUser(user.id, {
	// 		password: resetPasswordConfirmationDto.password,
	// 	});
	//
	// 	if (!isUpdated) {
	// 		throw new UnprocessableEntityException(['Failed to update password. Please try again']);
	// 	}
	//
	// 	await this._passwordResetTokensService.deleteToken(user.passwordResetToken.id);
	// }
	//
	// // TODO check if needed
	// @Post('login')
	// @HttpCode(HttpStatus.OK)
	// @UseInterceptors(TransformInterceptor)
	// public async login(
	// 	@Res({ passthrough: true }) response: Response,
	// 	@Body() loginDto: LoginDto,
	// ): Promise<LoginResponseDto[]> {
	// 	const user: UserFullDto | null = await this._usersService.getFullUserByEmail(loginDto.email);
	//
	// 	if (!user) {
	// 		throw new UnprocessableEntityException(['Invalid email or password|email']);
	// 	}
	//
	// 	const isPasswordValid: boolean = await this._authService.validatePassword(
	// 		loginDto.password,
	// 		user.password,
	// 	);
	//
	// 	if (!isPasswordValid) {
	// 		throw new UnprocessableEntityException(['Invalid email or password|email']);
	// 	}
	//
	// 	const accessToken: string = await this._jwtTokensService.generateAccessToken(
	// 		this._createJwtPayload(user),
	// 	);
	//
	// 	const refreshToken: string = await this._jwtTokensService.generateRefreshToken(
	// 		this._createJwtPayload(user),
	// 	);
	//
	// 	const savedTokenId: string = await this._jwtTokensService.saveRefreshToken(
	// 		user.JWTToken?.id || null,
	// 		refreshToken,
	// 	);
	//
	// 	const token: JWTTokenFullDto | null = await this._jwtTokensService.getById(savedTokenId);
	//
	// 	if (!token) {
	// 		throw new UnprocessableEntityException(['Failed to login. Please try again']);
	// 	}
	//
	// 	const isTokenIdUpdated: boolean = await this._usersService.updateUser(user.id, {
	// 		JWTToken: token as JWTToken,
	// 	});
	//
	// 	if (!isTokenIdUpdated) {
	// 		throw new UnprocessableEntityException(['Failed to login. Please try again']);
	// 	}
	//
	// 	response.cookie(CookiesNames.REFRESH_TOKEN, refreshToken, {
	// 		maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
	// 		secure: true,
	// 		sameSite: 'strict',
	// 		httpOnly: true,
	// 	});
	//
	// 	return [{ accessToken }];
	// }
	//
	// // TODO check if needed
	// @Post('logout')
	// @HttpCode(HttpStatus.NO_CONTENT)
	// public async logout(
	// 	@Res({ passthrough: true }) response: Response,
	// 	@Cookie(CookiesNames.REFRESH_TOKEN) refreshToken: string,
	// ): Promise<void> {
	// 	const userData: JWTPayloadDto | null =
	// 		await this._jwtTokensService.verifyRefreshToken(refreshToken);
	//
	// 	if (userData) {
	// 		const fullUserData: UserFullDto | null = await this._usersService.getFullUserByEmail(
	// 			userData.email,
	// 		);
	//
	// 		if (!fullUserData || !fullUserData.JWTToken) {
	// 			throw new UnprocessableEntityException(['Failed to log out. Please try again']);
	// 		}
	//
	// 		const isCookieDeleted: boolean = await this._jwtTokensService.deleteToken(
	// 			fullUserData.JWTToken.id,
	// 		);
	//
	// 		const isUserUpdated: boolean = await this._usersService.updateUser(userData.id, {
	// 			JWTToken: null,
	// 		});
	//
	// 		if (!isCookieDeleted || !isUserUpdated) {
	// 			throw new UnprocessableEntityException(['Failed to log out. Please try again']);
	// 		}
	// 	}
	//
	// 	response.clearCookie(CookiesNames.REFRESH_TOKEN);
	// }
	//
	// // TODO check if needed
	// @Post('refresh')
	// @HttpCode(HttpStatus.OK)
	// public async refresh(
	// 	@Res({ passthrough: true }) response: Response,
	// 	@Cookie(CookiesNames.REFRESH_TOKEN) refreshToken: string,
	// ): Promise<LoginResponseDto[]> {
	// 	const userData: JWTPayloadDto | null =
	// 		await this._jwtTokensService.verifyRefreshToken(refreshToken);
	//
	// 	if (!userData) {
	// 		throw new UnauthorizedException(['Please, login to perform this action']);
	// 	}
	//
	// 	const user: UserFullDto | null = await this._usersService.getFullUserByEmail(userData.email);
	//
	// 	if (!user || !user.JWTToken) {
	// 		throw new UnauthorizedException(['Please, login to perform this action']);
	// 	}
	//
	// 	const token: JWTTokenFullDto | null = await this._jwtTokensService.getById(user.JWTToken.id);
	//
	// 	if (!token) {
	// 		throw new UnauthorizedException(['Please, login to perform this action']);
	// 	}
	//
	// 	const newAccessToken: string = await this._jwtTokensService.generateAccessToken(
	// 		this._createJwtPayload(user),
	// 	);
	//
	// 	const newRefreshToken: string = await this._jwtTokensService.generateRefreshToken(
	// 		this._createJwtPayload(user),
	// 	);
	//
	// 	await this._jwtTokensService.saveRefreshToken(user.JWTToken.id, newRefreshToken);
	//
	// 	response.cookie(CookiesNames.REFRESH_TOKEN, newRefreshToken, {
	// 		maxAge: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN) * 1000,
	// 		secure: true,
	// 		sameSite: 'strict',
	// 		httpOnly: true,
	// 	});
	//
	// 	return [{ accessToken: newAccessToken }];
	// }
	//
	// private _createJwtPayload(user: UserFullDto): JWTPayloadDto {
	// 	return {
	// 		id: user.id,
	// 		email: user.email,
	// 		firstName: user.firstName,
	// 		lastName: user.lastName,
	// 		nickname: user.nickname,
	// 	};
	// }
}
