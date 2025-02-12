import {
	ConflictException,
	Inject,
	Injectable,
	UnprocessableEntityException,
} from '@nestjs/common';
import { IAuthService } from '@services/auth/IAuthService';
import { SignupRequestDto } from '@dtos/auth/SignupRequest.dto';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { OTPCodesHelper } from '@helpers/OTPCodes.helper';
import { DateHelper } from '@helpers/date.helper';
import { IUsersService } from '@services/users/IUsersService';
import { UserDto } from '@dtos/users/UserDto';
import { IEmailService } from '@services/email/IEmailService';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.CTF_EMAIL_SERVICE)
		private readonly _emailService: IEmailService,
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

		const otpCode: number = OTPCodesHelper.generateOTPCode();
		const otpCodeExpirationDate: string = DateHelper.dateTimeFuture(1000 * 60 * 10);

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

	// // TODO check if needed
	// public async activateAccount(accountActivationDto: AccountActivationDto): Promise<boolean> {
	// 	const otpCode: OTPCode | null = await this._otpCodesRepository.getUserOTPCodeById(
	// 		accountActivationDto.OTPCodeId,
	// 	);
	//
	// 	if (!otpCode) {
	// 		return false;
	// 	}
	//
	// 	const isExpired: boolean = OTPCodesHelper.isExpired(
	// 		plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true }),
	// 	);
	//
	// 	if (isExpired || accountActivationDto.code !== otpCode.code) {
	// 		return false;
	// 	}
	//
	// 	return await this._usersRepository.updateUser(accountActivationDto.id, {
	// 		isActivated: true,
	// 	});
	// }
	//
	// // TODO check if needed
	// public async validatePassword(passwordFromDto: string, passwordFromDb: string): Promise<boolean> {
	// 	return await bcrypt.compare(passwordFromDto, passwordFromDb);
	// }
}
