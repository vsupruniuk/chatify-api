import { User } from '@entities';

import { SignupRequestDto } from '@dtos/auth/signup';
import { UpdateAppUserRequestDto } from '@dtos/appUser';

/**
 * Repository interface for database actions with users
 */
export interface IUsersRepository {
	/**
	 * Find existing user by the email or nickname
	 * @param email - user email to search
	 * @param nickname - user nickname to search
	 * @returns Promise<User | null> - user if it was found by the nickname or email, or null
	 */
	findByEmailOrNickname(email: string, nickname: string): Promise<User | null>;

	/**
	 * Find existing user by the id
	 * @param id - user id to search
	 * @returns Promise<User | null> - user if it was found by the id, or null
	 */
	findById(id: string): Promise<User | null>;

	/**
	 * Find all existing users by provided array of ids
	 * @param ids - users ids to search
	 * @returns Promise<User[]> - array of all found users with the relevant ids
	 */
	findAllByIds(ids: string[]): Promise<User[]>;

	/**
	 * Find existing user by the nickname
	 * @param nickname - user nickname to search
	 * @returns Promise<User | null> - user if it was found by the nickname, or null
	 */
	findByNickname(nickname: string): Promise<User | null>;

	/**
	 * Find existing user by the password reset token that is not expired
	 * @param token - token value to search
	 * @returns Promise<User | null> - user if it was found by the token value, or null
	 */
	findByNotExpiredPasswordResetToken(token: string): Promise<User | null>;

	/**
	 * Find existing user by the email and if it's not active together with OTP code
	 * @param email - user email to search
	 * @returns Promise<User | null> - user with OTP code if it was found, or null
	 */
	findByEmailAndNotActiveWithOtpCode(email: string): Promise<User | null>;

	/**
	 * Find existing user by the email together with password reset token
	 * @param email - user email to search
	 * @returns Promise<User | null> - user with password reset token if it was found, or null
	 */
	findByEmailWithPasswordResetToken(email: string): Promise<User | null>;

	/**
	 * Find existing user with full information by the email together with JWT token
	 * @param email - user email to search
	 * @returns Promise<User | null> - user with JWT token if it was found, or null
	 */
	findFullUserWithJwtTokenByEmail(email: string): Promise<User | null>;

	/**
	 * Find existing user by the id together with account settings
	 * @param id - user id to search
	 * @returns Promise<User | null> - user with account settings if it was found, or null
	 */
	findByIdWithAccountSettings(id: string): Promise<User | null>;

	/**
	 * Find existing and active users by the nickname pattern
	 * @param nickname - users nickname pattern to search
	 * @param skip - number of records to skip
	 * @param take - number of records to take
	 * @returns Promise<User[]> - array of found users
	 */
	findUsersByNicknameAndActive(nickname: string, skip: number, take: number): Promise<User[]>;

	/**
	 * Creates user together with default records for account settings, JWT token, password reset token
	 * and OTP code
	 * @param otpCode - OTP code value for later activation
	 * @param otpCodeExpiresAt - OTP code expiration date
	 * @param signupRequestDto - DTO object with information provided by the user on registration
	 * @returns Promise<User> - created user record
	 * @remarks - method using transaction. In case if any operation with database will fail,
	 * all other will not be applied
	 */
	createUser(
		otpCode: number,
		otpCodeExpiresAt: string,
		signupRequestDto: SignupRequestDto,
	): Promise<User>;

	/**
	 * Activates user account and deactivates OTP code
	 * @param userId - user id to activate
	 * @param otpCodeId - OTP code id to deactivate
	 * @returns Promise<User | null> - activated user record, or null if failed to retrieve user
	 * @remarks - method using transaction. In case if any operation with database will fail,
	 * all other will not be applied
	 */
	activateUser(userId: string, otpCodeId: string): Promise<User | null>;

	/**
	 * Updates user password and deactivates password reset token
	 * @param userId - user id to change password
	 * @param tokenId - password reset token id to reset
	 * @param password - new user password
	 * @returns Promise<User | null> - user record with changed password, or null if failed to retrieve user
	 * @remarks - method using transaction. In case if any operation with database will fail,
	 * all other will not be applied
	 */
	updatePassword(userId: string, tokenId: string, password: string): Promise<User | null>;

	/**
	 * Updates user public information
	 * @param id - user id to change public information
	 * @param updateAppUserDto - DTO object with new public information values
	 * @returns Promise<User | null> - user record with changed information, or null if failed to retrieve user
	 * @remarks - method using transaction. In case if any operation with database will fail,
	 * all other will not be applied
	 */
	updateAppUser(id: string, updateAppUserDto: UpdateAppUserRequestDto): Promise<User | null>;

	/**
	 * Updates user avatar url
	 * @param userId - user id to update avatar url
	 * @param avatarUrl - new avatar url value
	 */
	updateUserAvatarUrl(userId: string, avatarUrl: string | null): Promise<void>;
}
