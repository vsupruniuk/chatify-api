import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';
import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DateHelper } from '@Helpers/date.helper';
import { OTPCodesHelper } from '@Helpers/OTPCodes.helper';
import { IOTPCodesRepository } from '@Interfaces/OTPCodes/IOTPCodesRepository';
import { IOTPCodesService } from '@Interfaces/OTPCodes/IOTPCodesService';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OTPCodesService implements IOTPCodesService {
	constructor(
		@Inject(CustomProviders.I_OTP_CODES_REPOSITORY)
		private readonly _otpCodesRepository: IOTPCodesRepository,
	) {}

	public async updateOTPCode(
		userOTPCodeId: string,
		updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	): Promise<boolean> {
		return await this._otpCodesRepository.updateOTPCode(userOTPCodeId, updateOTPCodeDto);
	}

	public async createNewOTPCode(userOTPCodeId: string | null): Promise<boolean> {
		if (!userOTPCodeId) {
			return false;
		}

		const newCode: UpdateOTPCodeDto = {
			code: OTPCodesHelper.generateOTPCode(),
			expiresAt: DateHelper.dateTimeFuture(1000 * 60 * 10),
		};

		return await this._otpCodesRepository.updateOTPCode(userOTPCodeId, newCode);
	}

	public async getUserOTPCode(userOTPCodeId: string | null): Promise<OTPCodeResponseDto | null> {
		if (!userOTPCodeId) {
			return null;
		}

		const otpCode: OTPCodeResponseDto | null =
			await this._otpCodesRepository.getUserOTPCodeById(userOTPCodeId);

		if (!otpCode) {
			return null;
		}

		const isExpired: boolean = OTPCodesHelper.isExpired(otpCode);

		return !isExpired ? otpCode : null;
	}
}
