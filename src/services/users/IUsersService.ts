import { UserDto } from '@dtos/users/UserDto';
import { SignupRequestDto } from '@dtos/auth/signup/SignupRequest.dto';
import { UserWithOtpCodeDto } from '@dtos/users/UserWithOtpCodeDto';
import { UserWithJwtTokenDto } from '@dtos/users/UserWithJwtTokenDto';
import { UserWithPasswordResetTokenDto } from '@dtos/users/UserWithPasswordResetTokenDto';

/**
 * Interface representing public methods of users service
 */
export interface IUsersService {
	/**
	 * Method for searching user by its email or nickname
	 * @param email - user email to search
	 * @param nickname - user nickname to search
	 * @returns UserDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByEmailOrNickname(email: string, nickname: string): Promise<UserDto | null>;

	/**
	 * Method for searching user by password reset token
	 * @param token - password reset token sent with email
	 * @returns UserDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByNotExpiredPasswordResetToken(token: string): Promise<UserWithPasswordResetTokenDto | null>;

	/**
	 * Method for searching user with OTP code by email
	 * @param email - user email for search
	 * @returns UserWithOtpCodeDto - if user was found
	 * @returns null if user wasn't found
	 */
	getByEmailAndNotActiveWithOtpCode(email: string): Promise<UserWithOtpCodeDto | null>;

	/**
	 * Method for searching user with password reset token by email
	 * @param email - user email for search
	 * @returns UserWithPasswordResetTokenDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getByEmailWithPasswordResetToken(email: string): Promise<UserWithPasswordResetTokenDto | null>;

	/**
	 * Method for creating user from signup data with some default settings
	 * @param otpCode - 6-digit number for creating OTP code
	 * @param otpCodeExpiresAt – expiration date for creating OTP code
	 * @param signupRequestDto - signup data taken from user
	 * @returns true - if user was created
	 * @returns false - if user wasn't created
	 */
	createUser(
		otpCode: number,
		otpCodeExpiresAt: string,
		signupRequestDto: SignupRequestDto,
	): Promise<boolean>;

	/**
	 * Method for activating user and clearing user OTP code
	 * @param userId - user id for activating user
	 * @param otpCodeId - OTP code id for clearing code
	 * @returns UserWithJwtTokenDto - if user was activated
	 * @returns null - if user wasn't activated
	 */
	activateUser(userId: string, otpCodeId: string): Promise<UserWithJwtTokenDto | null>;

	/**
	 * Method for changing user password
	 * @param userId - user id
	 * @param tokenId - password reset token id
	 * @param password - new password provided by user
	 * @returns true - if password was updated
	 * @returns false - if password wasn't updated
	 */
	changeUserPassword(userId: string, tokenId: string, password: string): Promise<boolean>;

	// /**
	//  * Method for searching users by their nicknames
	//  * @param userNickname - logged-in user nickname
	//  * @param nickname - user nickname for search
	//  * @param page - number of skipped record sets. Default: 1
	//  * @param take - number of records to take. Default: 10
	//  * @returns UserPublicDto[] - array of founded users
	//  * @returns [] - empty array if no users found
	//  */
	// getPublicUsers(
	// 	userNickname: string,
	// 	nickname: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<UserPublicDto[]>;
	//
	// /**
	//  * Method for searching user by id. Return all user information (except service information of the DB)
	//  * @param email - user id for searching
	//  * @returns UserFullDto - if user was found. Not used as API public response
	//  * @returns null - if user wasn't found
	//  */
	// getFullUserByEmail(email: string): Promise<UserFullDto | null>;
	//
	// /**
	//  * Method for searching user by id. Return all user information (except service information of the DB)
	//  * @param id - user id for searching
	//  * @returns UserFullDto - if user was found. Not used as API public response
	//  * @returns null - if user wasn't found
	//  */
	// getFullUserById(id: string): Promise<UserFullDto | null>;
	//
	// /**
	//  * Method for searching one specific user by email
	//  * @param email - user email for searching
	//  * @returns UserShortDto - if user was found
	//  * @returns null - if user wasn't found
	//  */
	// getByEmail(email: string): Promise<UserShortDto | null>;
	//
	// /**
	//  * Method for searching one specific user by nickname
	//  * @param nickname - user nickname for searching
	//  * @returns UserShortDto - if user was found
	//  * @returns null - if user wasn't found
	//  */
	// getByNickname(nickname: string): Promise<UserShortDto | null>;
	//
	//
	// /**
	//  * Method for searching user by its password reset token
	//  * @param token - user reset token
	//  * @returns UserShortDto - if user was found
	//  * @returns null - if user wasn't found
	//  */
	// getByResetPasswordToken(token: string): Promise<UserFullDto | null>;
	//
	// /**
	//  * Method for searching current authorized user
	//  * @param id - user id from access token
	//  * @returns AppUserDto - if user was found
	//  * @returns null - if user wasn't found
	//  */
	// getAppUser(id: string): Promise<AppUserDto | null>;
	//

	//
	// /**
	//  * Method for updating user password
	//  * @param userId - id of user which will be updated
	//  * @param updateUserDto - dto with a new user data
	//  * @returns true - if user was updated
	//  * @returns false - if user wasn't updated
	//  */
	// updateUser(userId: string, updateUserDto: Partial<UpdateUserDto>): Promise<boolean>;
}
