import { Inject, Injectable } from '@nestjs/common';
import { IOTPCodesService } from '@services/otpCode/IOTPCodesService';
import { OTPCodesHelper } from '@helpers/OTPCodes.helper';
import { DateHelper } from '@helpers/date.helper';
import { otpCodeConfig } from '@configs/otpCode.config';
import { OTPCode } from '@entities/OTPCode.entity';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IOTPCodesRepository } from '@repositories/otpCode/IOTPCodesRepository';

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

	// // TODO check if needed
	// public async updateOTPCode(
	// 	userOTPCodeId: string,
	// 	updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	// ): Promise<boolean> {
	// 	return await this._otpCodesRepository.updateOTPCode(userOTPCodeId, updateOTPCodeDto);
	// }
	//
	// // TODO check if needed
	// public async createNewOTPCode(userOTPCodeId: string | null): Promise<boolean> {
	// 	if (!userOTPCodeId) {
	// 		return false;
	// 	}
	//
	// 	const newCode: UpdateOTPCodeDto = {
	// 		code: OTPCodesHelper.generateOTPCode(),
	// 		expiresAt: DateHelper.dateTimeFuture(1000 * 60 * 10),
	// 	};
	//
	// 	return await this._otpCodesRepository.updateOTPCode(userOTPCodeId, newCode);
	// }
	//
	// // TODO check if needed
	// public async getUserOTPCode(userOTPCodeId: string | null): Promise<OTPCodeResponseDto | null> {
	// 	if (!userOTPCodeId) {
	// 		return null;
	// 	}
	//
	// 	const otpCode: OTPCode | null =
	// 		await this._otpCodesRepository.getUserOTPCodeById(userOTPCodeId);
	//
	// 	if (!otpCode || OTPCodesHelper.isExpired(otpCode)) {
	// 		return null;
	// 	}
	//
	// 	return plainToInstance(OTPCodeResponseDto, otpCode, { excludeExtraneousValues: true });
	// }
	//
	// // TODO check if needed
	// public async deactivateUserOTPCode(userOTPCodeId: string): Promise<boolean> {
	// 	return await this._otpCodesRepository.updateOTPCode(userOTPCodeId, {
	// 		expiresAt: null,
	// 		code: null,
	// 	});
	// }
}
