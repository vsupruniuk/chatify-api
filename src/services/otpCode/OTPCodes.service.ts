import { Inject, Injectable } from '@nestjs/common';

import { IOTPCodesService } from '@services';

import { OTPCodesHelper, DateHelper } from '@helpers';

import { otpCodeConfig } from '@configs';

import { OTPCode } from '@entities';

import { CustomProviders } from '@enums';

import { IOTPCodesRepository } from '@repositories';

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
