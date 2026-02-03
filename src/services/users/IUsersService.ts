import {
	FullUserWithJwtTokenDto,
	UserDto,
	UserWithAccountSettingsDto,
	UserWithJwtTokenDto,
	UserWithOtpCodeDto,
	UserWithPasswordResetTokenDto,
} from '@dtos/users';
import { SignupRequestDto } from '@dtos/auth/signup';

/**
 * Service interface for actions with users
 */
export interface IUsersService {
	/**
	 * Get a user by the id
	 * @param id - user id for search
	 * @returns Promise<UserDto | null> - found user or null
	 */
	getById(id: string): Promise<UserDto | null>;

	/**
	 * Get a user by the nickname
	 * @param nickname - user nickname for search
	 * @returns Promise<UserDto | null> - found user or null
	 */
	getByNickname(nickname: string): Promise<UserDto | null>;

	/**
	 * Get all users by the array of ids
	 * @param ids - array of ids to search
	 * @returns Promise<UserDto[]> - array of found users
	 */
	getAllByIds(ids: string[]): Promise<UserDto[]>;

	/**
	 * Get a user by the email or nickname
	 * @param email - user email for search
	 * @param nickname - user nickname for search
	 * @returns Promise<UserDto | null> - found user or null
	 */
	getByEmailOrNickname(email: string, nickname: string): Promise<UserDto | null>;

	/**
	 * Get a user by valid and not expired password reset token
	 * @param token - user password reset token for search
	 * @returns Promise<UserWithPasswordResetTokenDto | null> - found user with password reset token or null
	 */
	getByNotExpiredPasswordResetToken(token: string): Promise<UserWithPasswordResetTokenDto | null>;

	/**
	 * Get a not activated user by email with OTP code
	 * @param email - user email for search
	 * @returns Promise<UserWithOtpCodeDto | null> - found user with OTP code or null
	 */
	getByEmailAndNotActiveWithOtpCode(email: string): Promise<UserWithOtpCodeDto | null>;

	/**
	 * Get a user by email with password reset token
	 * @param email - user email for search
	 * @returns Promise<UserWithPasswordResetTokenDto | null> - found user with password reset token or null
	 */
	getByEmailWithPasswordResetToken(email: string): Promise<UserWithPasswordResetTokenDto | null>;

	/**
	 * Get a full user by email with JWT token
	 * @param email - user email for search
	 * @returns Promise<FullUserWithJwtTokenDto | null> - found user with JWT token or null
	 */
	getFullUserWithJwtTokenByEmail(email: string): Promise<FullUserWithJwtTokenDto | null>;

	/**
	 * Get a user by id with account settings
	 * @param id - user id for search
	 * @returns Promise<UserWithAccountSettingsDto | null> - found user with account settings or null
	 */
	getByIdWithAccountSettings(id: string): Promise<UserWithAccountSettingsDto | null>;

	/**
	 * Get activated users by nickname pattern
	 * @param nickname - user nickname pattern for search
	 * @param page - pagination page number
	 * @param take - number of records to take
	 * @returns Promise<UserDto[]> - array of found users
	 */
	getActivatedUsersByNickname(nickname: string, page: number, take: number): Promise<UserDto[]>;

	/**
	 * Create a new user with base configuration
	 * @param otpCode - OTP code value
	 * @param otpCodeExpiresAt - OTP code expiration date
	 * @param signupRequestDto - DTO object with user registration information
	 * @returns Promise<UserWithJwtTokenDto | null> - created user with JTW token or null
	 */
	createUser(
		otpCode: number,
		otpCodeExpiresAt: string,
		signupRequestDto: SignupRequestDto,
	): Promise<void>;

	/**
	 * Activates user account
	 * @param userId - user id for activation
	 * @param otpCodeId - OTP code id for reset
	 * @returns Promise<UserWithJwtTokenDto | null> - activated user with JWT token or null
	 */
	activateUser(userId: string, otpCodeId: string): Promise<UserWithJwtTokenDto | null>;

	/**
	 * Set a new password for the user
	 * @param userId - user id for password changing
	 * @param tokenId - password reset token id for reset
	 * @param password - new password value
	 * @returns Promise<boolean> - boolean value representing if password was changed or not
	 */
	changeUserPassword(userId: string, tokenId: string, password: string): Promise<boolean>;

	/**
	 * Updates user avatar url
	 * @param userId - user id for avatar url update
	 * @param avatarUrl - new avatar url or null
	 */
	updateUserAvatarUrl(userId: string, avatarUrl: string | null): Promise<void>;
}
