export interface IOTPCodesService {
	/**
	 * Method for regenerating OTP code and expiration date for existing core record
	 * @param id - code id
	 * @returns generated code
	 */
	regenerateCode(id: string): Promise<number | null>;
	// /**
	//  * Method for updating specific OTP code
	//  * @param userOTPCodeId - OTP code id that will be updated
	//  * @param updateOTPCodeDto - new data for updating
	//  * @returns true - if code was updated
	//  * @returns false - if code wasn't updated
	//  */
	// updateOTPCode(
	// 	userOTPCodeId: string,
	// 	updateOTPCodeDto: Partial<UpdateOTPCodeDto>,
	// ): Promise<boolean>;
	//
	// /**
	//  * Method for creating new OTP code for user
	//  * @param userOTPCodeId - OTP code id that will be updated
	//  * @returns true - if code was created
	//  * @returns false - if code wasn't created
	//  */
	// createNewOTPCode(userOTPCodeId: string | null): Promise<boolean>;
	//
	// /**
	//  * Method for searching OTP code for user
	//  * @param userOTPCodeId - OTP code id for specific user
	//  * @returns OTPCodeResponseDto - OTP code if code was found and code is not expire
	//  * @returns null - if code wasn't found or expire
	//  */
	// getUserOTPCode(userOTPCodeId: string | null): Promise<OTPCodeResponseDto | null>;
	//
	// /**
	//  * Method for deactivating user OTP code after it was used
	//  * @param userOTPCodeId - otp code id
	//  * @returns true - if code was deactivated
	//  * @returns false - if code wasn't deactivated
	//  */
	// deactivateUserOTPCode(userOTPCodeId: string): Promise<boolean>;
}
