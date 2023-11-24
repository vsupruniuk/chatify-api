import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

/**
 * Interface representing public methods of users service
 */
export interface IUsersService {
	/**
	 * Method for searching one specific user by email
	 * @param email - user email for searching
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByEmail(email: string): Promise<UserShortDto | null>;

	/**
	 * Method for searching one specific user by nickname
	 * @param nickname - user nickname for searching
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByNickname(nickname: string): Promise<UserShortDto | null>;
	/**
	 * Method for creating user from signup data with some default settings
	 * @param signupUserDto - signup data taken from user
	 * @returns UserShortDto - created user
	 */
	createUser(signupUserDto: SignupUserDto): Promise<UserShortDto>;

	/**
	 * Method for searching OTP code for user
	 * @param userOTPCodeId - OPT code id for specific user
	 * @returns OTPCodeResponseDto - OTP code if code was found and code is not expire
	 * @returns null - if code wasn't found or expire
	 */
	getUserOTPCode(userOTPCodeId: string): Promise<OTPCodeResponseDto | null>;
}
