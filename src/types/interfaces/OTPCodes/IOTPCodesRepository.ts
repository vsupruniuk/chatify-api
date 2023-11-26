import { CreateOTPCodeDto } from '@DTO/OTPCodes/CreateOTPCode.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

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

	/**
	 * Method for searching OTP code for user
	 * @param userOTPCodeId - OPT code id for specific user
	 * @returns OTPCodeResponseDto - OTP code if code was found
	 * @returns null - if code wasn't found
	 */
	getUserOTPCode(userOTPCodeId: string): Promise<OTPCodeResponseDto | null>;
}
