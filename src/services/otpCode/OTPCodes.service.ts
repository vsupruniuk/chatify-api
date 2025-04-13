import { Inject, Injectable } from '@nestjs/common';
import { IOTPCodesService } from '@services/otpCode/IOTPCodesService';
import { OTPCodesHelper } from '@helpers/OTPCodes.helper';
import { DateHelper } from '@helpers/date.helper';
import { otpCodeConfig } from '@configs/otpCode.config';
import { OTPCode } from '@entities/OTPCode.entity';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IOTPCodesRepository } from '@repositories/otpCodes/IOTPCodesRepository';

@Injectable()
export class OTPCodesService implements IOTPCodesService {
	constructor(
		@Inject(CustomProviders.CTF_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,
	) {}

	public async regenerateCode(id: string): Promise<number | null> {
		const otpCode: number = OTPCodesHelper.generateOTPCode();
		const otpCodeExpirationDate: string = DateHelper.dateTimeFuture(otpCodeConfig.ttl);

		const updatedCode: OTPCode = await this._otpCodesRepository.update(
			id,
			otpCode,
			otpCodeExpirationDate,
		);

		return updatedCode.code;
	}
}
