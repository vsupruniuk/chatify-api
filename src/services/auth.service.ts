import { AccountActivationDto } from '@DTO/auth/AccountActivation.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IAuthService } from '@Interfaces/auth/IAuthService';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IUsersRepository } from '@Interfaces/users/IUsersRepository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(CustomProviders.I_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,

		@Inject(CustomProviders.I_USERS_REPOSITORY)
		private readonly _usersRepository: IUsersRepository,
	) {}

	public async activateAccount(accountActivationDto: AccountActivationDto): Promise<boolean> {
		await this._usersRepository.updateUser('f86d7ac8-361b-4c5d-ae2c-104238c64c91', {
			firstName: 'NAMEe',
			lastName: 'test',
		});

		console.log(accountActivationDto);

		return undefined;
	}
}
