/**
 * Interface representing public methods of OTP codes repository
 */
export interface IOTPCodesRepository {
	// /**
	//  * Create OTP code with passed data
	//  * @param createOTPCodeDto - data for creating OTP code
	//  * @return id - id of created OTP code
	//  */
	// createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string>;
	//
	// /**
	//  * Method for searching OTP code for user by id of the code
	//  * @param userOTPCodeId - OPT code id for specific user
	//  * @returns OTPCode - OTP code if code was found
	//  * @returns null - if code wasn't found
	//  */
	// getUserOTPCodeById(userOTPCodeId: string): Promise<OTPCode | null>;
	//
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
}
