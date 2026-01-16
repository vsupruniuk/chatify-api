import { UserDto, UserWithAccountSettingsDto } from '@dtos/users';
import { UserWithOtpCodeDto } from '@dtos/users';
import { UserWithJwtTokenDto } from '@dtos/users';
import { UserWithPasswordResetTokenDto } from '@dtos/users';
import { FullUserWithJwtTokenDto } from '@dtos/users';
import { SignupRequestDto } from '@dtos/auth/signup';

/**
 * Interface representing public methods of users service
 */
export interface IUsersService {
	/**
	 * Method for searching user by id
	 * @param id - user id
	 * @returns UserDto - if user was found
	 * @returns null - if user wasn't found
	 */
	getById(id: string): Promise<UserDto | null>;

	getByNickname(nickname: string): Promise<UserDto | null>;

	/**
	 * Method for searching all users by ids
	 * @param ids - array of users ids
	 * @returns UserDto[] - array of founded users
	 */
	getAllByIds(ids: string[]): Promise<UserDto[]>;

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
	 * Method for getting full user by email without converting to DTO
	 * @param email - user email for searching
	 * @returns User - if user was found
	 * @returns null - if user wasn't found
	 */
	getFullUserWithJwtTokenByEmail(email: string): Promise<FullUserWithJwtTokenDto | null>;

	getByIdWithAccountSettings(id: string): Promise<UserWithAccountSettingsDto | null>;

	getActivatedUsersByNickname(nickname: string, page: number, take: number): Promise<UserDto[]>;

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
	): Promise<void>;

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

	/**
	 * Method for updating user avatar url
	 * @param userId - user id
	 * @param avatarUrl - new avatar url
	 */
	updateUserAvatarUrl(userId: string, avatarUrl: string | null): Promise<void>;
}
