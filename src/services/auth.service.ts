import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { OTPCode } from '@Entities/OTPCode.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(CustomProviders.I_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async activateAccount(accountActivationDto: AccountActivationDto): Promise<boolean> {
		const otpCode: OTPCode | null = await this._otpCodesRepository.getUserOTPCodeById(
			accountActivationDto.OTPCodeId,
		);

		if (!otpCode) {
			return false;
		}

		const isExpired: boolean = OTPCodesHelper.isExpired(
			plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true }),
		);

		if (isExpired || accountActivationDto.code !== otpCode.code) {
			return false;
		}

		return await this._usersRepository.updateUser(accountActivationDto.id, {
			isActivated: true,
		});
	}

	public async validatePassword(passwordFromDto: string, passwordFromDb: string): Promise<boolean> {
		return await bcrypt.compare(passwordFromDto, passwordFromDb);
	}
}
