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
}
