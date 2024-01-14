import { SignupUserDto } from '@DTO/users/SignupUser.dto';
import { UserFullDto } from '@DTO/users/UserFull.dto';
import { UserShortDto } from '@DTO/users/UserShort.dto';
import { OTPCodeResponseDto } from '@DTO/OTPCodes/OTPCodeResponse.dto';

/**
 * Interface representing public methods of users service
 */
export interface IUsersService {
	/**
	 * Method for searching user by id. Return all user information (except service information of the DB)
	 * @param email - user id for searching
	 * @returns UserFullDto - if user was found. Not used as API public response
	 * @returns null - if user wasn't found
	 */
	getFullUserByEmail(email: string): Promise<UserFullDto | null>;
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
	 * Method for searching user by its password reset token
	 * @param token - user reset token
	 * @returns UserShortDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByResetPasswordToken(token: string): Promise<UserFullDto | null>;

	/**
	 * Method for creating user from signup data with some default settings
	 * @param signupUserDto - signup data taken from user
	 * @returns UserShortDto - created user
	 * @returns null - if user wasn't created
	 */
	createUser(signupUserDto: SignupUserDto): Promise<UserShortDto | null>;

	/**
	 * Method for searching OTP code for user
	 * @param userOTPCodeId - OTP code id for specific user
	 * @returns OTPCodeResponseDto - OTP code if code was found and code is not expire
	 * @returns null - if code wasn't found or expire
	 */
	getUserOTPCode(userOTPCodeId: string | null): Promise<OTPCodeResponseDto | null>;

	/**
	 * Method for creating password reset token for user
	 * @param userId - user id for creating token
	 * @returns token - if token was created and saved to db
	 * @returns null - if token wasn't created
	 */
	createPasswordResetToken(userId: string): Promise<string | null>;
}
