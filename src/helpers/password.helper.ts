import * as bcrypt from 'bcrypt';

/**
 * Helper class for passwords
 */
export class PasswordHelper {
	/**
	 * Take and hash user password
	 * @param rawPassword - original user password
	 * @returns hashed password
	 */
	public static async hashPassword(rawPassword: string): Promise<string> {
		return await bcrypt.hash(rawPassword, Number(process.env.PASSWORD_SALT_HASH_ROUNDS));
	}

	/**
	 * Check if user password valid
	 * @param password - password provided by user
	 * @param encryptedPassword - encrypted user password from DB
	 * @returns true - if password valid
	 * @returns false - if password not valid
	 */
	public static async validatePassword(
		password: string,
		encryptedPassword: string,
	): Promise<boolean> {
		return await bcrypt.compare(password, encryptedPassword);
	}
}
