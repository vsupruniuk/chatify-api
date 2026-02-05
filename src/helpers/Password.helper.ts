import * as bcrypt from 'bcrypt';
import { passwordConfig } from '@configs';

/**
 * Class with static helper methods for password related actions
 */
export class PasswordHelper {
	/**
	 * Accept and hash a password with multiple rounds of salt
	 * @param rawPassword - original password string
	 * @returns Promise<string> - hashed password string
	 */
	public static async hashPassword(rawPassword: string): Promise<string> {
		return await bcrypt.hash(rawPassword, passwordConfig.saltHashRounds);
	}

	/**
	 * Compare raw provided password with the hashed one and returns is it valid or not
	 * @param rawPassword - password provided by user
	 * @param encryptedPassword - encrypted user password from DB
	 * @returns Promise<boolean> - boolean value represents if password valid or not
	 */
	public static async validatePassword(
		rawPassword: string,
		encryptedPassword: string,
	): Promise<boolean> {
		return await bcrypt.compare(rawPassword, encryptedPassword);
	}
}
