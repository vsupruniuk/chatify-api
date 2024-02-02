import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(CustomProviders.I_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async activateAccount(accountActivationDto: AccountActivationDto): Promise<boolean> {
		const otpCode: OTPCodeResponseDto | null = await this._otpCodesRepository.getUserOTPCodeById(
			accountActivationDto.OTPCodeId,
		);

		if (!otpCode) {
			return false;
		}

		const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

		if (isExpired) {
			return false;
		}

		if (accountActivationDto.code !== otpCode.code) {
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
