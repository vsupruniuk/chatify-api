import { UpdateOTPCodeDto } from '@DTO/OTPCodes/UpdateOTPCode.dto';

export interface IOTPCodesService {
	/**
	 * Method for updating specific OTP code
	 * @param userOTPCodeId - OTP code id that will be updated
	 * @param updateOTPCodeDto - new data for updating
	 * @returns true - if code was updated
	 * @returns false - if code wasn't updated
	 */
	updateOTPCode(
		userOTPCodeId: string,
		updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	): Promise<boolean>;

	/**
	 * Method for creating new OTP code for user
	 * @param userOTPCodeId - OTP code id that will be updated
	 * @returns true - if code was created
	 * @returns false - if code wasn't created
	 */
	createNewOTPCode(userOTPCodeId: string): Promise<boolean>;
}
