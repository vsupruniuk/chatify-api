import { Inject, Injectable } from '@nestjs/common';

import { IOtpCodesService } from '@services';

import { OtpCodesHelper, DateHelper } from '@helpers';

import { otpCodeConfig } from '@configs';

import { OTPCode } from '@entities';

import { CustomProvider } from '@enums';

import { IOtpCodesRepository } from '@repositories';

@Injectable()
export class OtpCodesService implements IOtpCodesService {
	constructor(
		@Inject(CustomProvider.CTF_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOtpCodesRepository,
	) {}

	public async regenerateCode(id: string): Promise<number | null> {
		const otpCode: number = OtpCodesHelper.generateOtpCode();
		const otpCodeExpirationDate: string = DateHelper.dateTimeFuture(otpCodeConfig.ttl);

		const updatedCode: OTPCode = await this._otpCodesRepository.updateOtpCode(
			id,
			otpCode,
			otpCodeExpirationDate,
		);

		return updatedCode.code;
	}
}
