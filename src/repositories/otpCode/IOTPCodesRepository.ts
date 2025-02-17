import { OTPCode } from '@entities/OTPCode.entity';

/**
 * Interface representing public methods of OTP codes repository
 */
export interface IOTPCodesRepository {
	/**
	 * Method for updating existing OTP code
	 * @param id - code id to update
	 * @param code - new code value
	 * @param expiresAt - new code expiration date
	 */
	update(id: string, code: number, expiresAt: string): Promise<OTPCode>;
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
}
