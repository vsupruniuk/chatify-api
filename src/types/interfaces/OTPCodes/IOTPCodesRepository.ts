import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';

/**
 * Interface representing public methods of OTP codes repository
 */
export interface IOTPCodesRepository {
	/**
	 * Create OTP code with passed data
	 * @param createOTPCodeDto - data for creating OTP code
	 * @return id - id of created OTP code
	 */
	createOTPCode(createOTPCodeDto: CreateOTPCodeDto): Promise<string>;
}
