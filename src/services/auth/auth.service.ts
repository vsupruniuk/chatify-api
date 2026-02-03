import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from '@nestjs/common';

import {
	IAuthService,
	IUsersService,
	IEmailService,
	IJwtTokensService,
	IOtpCodesService,
	IPasswordResetTokensService,
} from '@services';

import { SignupRequestDto } from '@dtos/auth/signup';
import { ActivateAccountRequestDto, ActivateAccountDto } from '@dtos/auth/accountActivation';
import { ResendActivationCodeRequestDto } from '@dtos/auth/resendActivationCode';
import { ResetPasswordRequestDto } from '@dtos/auth/resetPassword';
import { LoginRequestDto, LoginDto } from '@dtos/auth/login';
import { JwtPayloadDto } from '@dtos/jwt';
import {
	FullUserWithJwtTokenDto,
	UserDto,
	UserWithJwtTokenDto,
	UserWithOtpCodeDto,
	UserWithPasswordResetTokenDto,
} from '@dtos/users';

import { CustomProvider } from '@enums';

import { OtpCodesHelper, DateHelper, TransformHelper, PasswordHelper } from '@helpers';

import { otpCodeConfig } from '@configs';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(CustomProvider.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProvider.CTF_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,

		@Inject(CustomProvider.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJwtTokensService,

		@Inject(CustomProvider.CTF_OTP_CODES_SERVICE)
		private readonly _otpCodeService: IOtpCodesService,

		@Inject(CustomProvider.CTF_PASSWORD_RESET_TOKENS_SERVICE)
		private readonly _passwordResetTokensService: IPasswordResetTokensService,
	) {}

	public async registerUser(signupRequestDto: SignupRequestDto): Promise<void> {
		const existingUser: UserDto | null = await this._usersService.getByEmailOrNickname(
			signupRequestDto.email,
			signupRequestDto.nickname,
		);

		if (existingUser) {
			const errorMessage: string =
				existingUser.email === signupRequestDto.email
					? 'This email is already taken|email'
					: 'This nickname is already taken|nickname';

			throw new ConflictException(errorMessage);
		}

		const otpCode: number = OtpCodesHelper.generateOtpCode();
		const otpCodeExpirationDate: string = DateHelper.dateTimeFuture(otpCodeConfig.ttl);

		await this._usersService.createUser(otpCode, otpCodeExpirationDate, signupRequestDto);

		await this._emailService.sendActivationEmail(signupRequestDto.email, otpCode);
	}

	public async activateAccount(
		activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountDto> {
		const user: UserWithOtpCodeDto | null =
			await this._usersService.getByEmailAndNotActiveWithOtpCode(activateAccountRequestDto.email);

		if (!user) {
			throw new NotFoundException('No user for activation found with this email|email');
		}

		if (activateAccountRequestDto.code !== user.otpCode.code) {
			throw new BadRequestException('OTP code is incorrect|code');
		}

		if (OtpCodesHelper.isExpired(user.otpCode)) {
			throw new BadRequestException('OTP code is expired|code');
		}

		const activatedUser: UserWithJwtTokenDto | null = await this._usersService.activateUser(
			user.id,
			user.otpCode.id,
		);

		if (!activatedUser) {
			throw new UnprocessableEntityException('Failed to activate user, please try again');
		}

		const { accessToken, refreshToken } = await this._proceedLogin(activatedUser);

		return TransformHelper.toTargetDto(ActivateAccountDto, <ActivateAccountDto>{
			accessToken,
			refreshToken,
		});
	}

	public async resendActivationCode(
		resendActivationCodeRequestDto: ResendActivationCodeRequestDto,
	): Promise<void> {
		const user: UserWithOtpCodeDto | null =
			await this._usersService.getByEmailAndNotActiveWithOtpCode(
				resendActivationCodeRequestDto.email,
			);

		if (!user) {
			throw new NotFoundException('No user for activation found with this email');
		}

		const updatedOtpCode: number | null = await this._otpCodeService.regenerateCode(
			user.otpCode.id,
		);

		if (!updatedOtpCode) {
			throw new UnprocessableEntityException('Failed to generate new OTP code, please try again');
		}

		await this._emailService.sendActivationEmail(
			resendActivationCodeRequestDto.email,
			updatedOtpCode,
		);
	}

	public async resetPassword(resetPasswordRequestDto: ResetPasswordRequestDto): Promise<void> {
		const user: UserWithPasswordResetTokenDto | null =
			await this._usersService.getByEmailWithPasswordResetToken(resetPasswordRequestDto.email);

		if (!user) {
			throw new NotFoundException('User with this email does not exist|email');
		}

		const passwordResetToken: string | null =
			await this._passwordResetTokensService.regenerateToken(user.passwordResetToken.id);

		if (!passwordResetToken) {
			throw new UnprocessableEntityException(
				'Failed to generate password reset token, please try again',
			);
		}

		await this._emailService.sendResetPasswordEmail(user.email, user.firstName, passwordResetToken);
	}

	public async confirmResetPassword(password: string, token: string): Promise<void> {
		const user: UserWithPasswordResetTokenDto | null =
			await this._usersService.getByNotExpiredPasswordResetToken(token);

		if (!user) {
			throw new NotFoundException('User associated with this token not found');
		}

		const isPasswordUpdated: boolean = await this._usersService.changeUserPassword(
			user.id,
			user.passwordResetToken.id,
			password,
		);

		if (!isPasswordUpdated) {
			throw new UnprocessableEntityException('Failed to reset password, please try again');
		}
	}

	public async login(loginRequestDto: LoginRequestDto): Promise<LoginDto> {
		const user: FullUserWithJwtTokenDto | null =
			await this._usersService.getFullUserWithJwtTokenByEmail(loginRequestDto.email);

		if (!user) {
			throw new NotFoundException('User with this email does not exist|email');
		}

		const isPasswordValid: boolean = await PasswordHelper.validatePassword(
			loginRequestDto.password,
			user.password,
		);

		if (!isPasswordValid) {
			throw new BadRequestException('Invalid password|password');
		}

		const { accessToken, refreshToken } = await this._proceedLogin(user);

		return TransformHelper.toTargetDto(LoginDto, <LoginDto>{ accessToken, refreshToken });
	}

	public async logout(refreshToken: string): Promise<void> {
		const userPayload: JwtPayloadDto | null =
			await this._jwtTokensService.verifyRefreshToken(refreshToken);

		if (userPayload) {
			const isReset: boolean = await this._jwtTokensService.resetUserToken(userPayload.id);

			if (!isReset) {
				throw new UnprocessableEntityException('Failed to logout, please try again');
			}
		}
	}

	public async refresh(userRefreshToken: string): Promise<LoginDto> {
		const userPayload: JwtPayloadDto | null =
			await this._jwtTokensService.verifyRefreshToken(userRefreshToken);

		if (!userPayload) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		const user: FullUserWithJwtTokenDto | null =
			await this._usersService.getFullUserWithJwtTokenByEmail(userPayload.email);

		if (!user) {
			throw new UnauthorizedException('Please, login to perform this action');
		}

		const { accessToken, refreshToken } = await this._proceedLogin(user);

		return TransformHelper.toTargetDto(LoginDto, <LoginDto>{ accessToken, refreshToken });
	}

	private async _proceedLogin<T extends UserWithJwtTokenDto>(user: T): Promise<LoginDto> {
		const accessToken: string = await this._jwtTokensService.generateAccessToken(
			TransformHelper.toJwtTokenPayload(user),
		);

		const refreshToken: string = await this._jwtTokensService.generateRefreshToken(
			TransformHelper.toJwtTokenPayload(user),
		);

		await this._jwtTokensService.saveRefreshToken(user.jwtToken.id, refreshToken);

		return { accessToken, refreshToken };
	}
}
