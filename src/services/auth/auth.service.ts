import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { IAuthService } from '@services/auth/IAuthService';
import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { OTPCodesHelper } from '@helpers/OTPCodes.helper';
import { DateHelper } from '@helpers/date.helper';
import { IUsersService } from '@services/users/IUsersService';
import { UserDto } from '@dtos/users/UserDto';
import { IEmailService } from '@services/email/IEmailService';
import { ActivateAccountRequestDto } from '@dtos/auth/accountActivation/ActivateAccountRequest.dto';
import { UserWithOtpCodeDto } from '@dtos/users/UserWithOtpCodeDto';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { TransformHelper } from '@helpers/transform.helper';
import { ActivateAccountDto } from '@dtos/auth/accountActivation/ActivateAccount.dto';
import { UserWithJwtTokenDto } from '@dtos/users/UserWithJwtTokenDto';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.CTF_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,

		@Inject(CustomProviders.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokensService: IJWTTokensService,
	) {}
	private readonly OTP_CODE_EXPIRATION_TIME: number = 1000 * 60 * 10;

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

		const otpCode: number = OTPCodesHelper.generateOTPCode();
		const otpCodeExpirationDate: string = DateHelper.dateTimeFuture(this.OTP_CODE_EXPIRATION_TIME);

		const isUserCreated: boolean = await this._usersService.createUser(
			otpCode,
			otpCodeExpirationDate,
			signupRequestDto,
		);

		if (!isUserCreated) {
			throw new UnprocessableEntityException('Failed to create a user. Please try again');
		}

		await this._emailService.sendActivationEmail(signupRequestDto.email, otpCode);
	}

	public async activateAccount(
		activateAccountRequestDto: ActivateAccountRequestDto,
	): Promise<ActivateAccountDto> {
		const user: UserWithOtpCodeDto | null =
			await this._usersService.getByEmailAndNotActiveWithOtpCode(activateAccountRequestDto.email);

		if (!user) {
			throw new NotFoundException('No user for activation found with this email');
		}

		if (activateAccountRequestDto.code !== user.otpCode.code) {
			throw new BadRequestException('OTP code is incorrect');
		}

		if (OTPCodesHelper.isExpired(user.otpCode)) {
			throw new BadRequestException('OTP code is expired');
		}

		const activatedUser: UserWithJwtTokenDto | null = await this._usersService.activateUser(
			user.id,
			user.otpCode.id,
		);

		if (!activatedUser) {
			throw new UnprocessableEntityException('Failed to activate user, please try again');
		}

		const accessToken: string = await this._jwtTokensService.generateAccessToken(
			TransformHelper.toJwtTokenPayload(activatedUser),
		);

		const refreshToken: string = await this._jwtTokensService.generateRefreshToken(
			TransformHelper.toJwtTokenPayload(activatedUser),
		);

		await this._jwtTokensService.saveRefreshToken(activatedUser.jwtToken.id, refreshToken);

		return TransformHelper.toTargetDto(ActivateAccountDto, <ActivateAccountDto>{
			accessToken,
			refreshToken,
		});
	}
}
