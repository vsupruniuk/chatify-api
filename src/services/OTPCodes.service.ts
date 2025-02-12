import { Injectable } from '@nestjs/common';
import { IOTPCodesService } from '@interfaces/OTPCodes/IOTPCodesService';

@Injectable()
export class OTPCodesService implements IOTPCodesService {
	constructor() // private readonly _otpCodesRepository: IOTPCodesRepository, // @Inject(CustomProviders.CTF_OTP_CODES_REPOSITORY)
	{}

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
