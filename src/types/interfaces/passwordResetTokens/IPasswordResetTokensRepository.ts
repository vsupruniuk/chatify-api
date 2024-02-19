import { PasswordResetTokenDto } from '@DTO/passwordResetTokens/passwordResetToken.dto';
import { PasswordResetTokenInfoDto } from '@DTO/passwordResetTokens/passwordResetTokenInfo.dto';
import { TPasswordResetTokensGetFields } from '@Types/passwordResetTokens/TPasswordResetTokensGetFields';
import { TUpdatePasswordResetToken } from '@Types/passwordResetTokens/TUpdatePasswordResetToken';

export interface IPasswordResetTokensRepository {
	/**
	 * Method for searching reset password token by id
	 * @param fieldName - field name to search
	 * @param fieldValue - field value to search
	 * @returns PasswordResetTokenDto - if token was found
	 * @returns null - if token wasn't found
	 */
	getByField(
		fieldName: TPasswordResetTokensGetFields,
		fieldValue: string,
	): Promise<PasswordResetTokenDto | null>;

	/**
	 * Method for creating password reset token in DB
	 * @param tokenDto - reset token and expiration date
	 * @returns id - id of created token
	 */
	createToken(tokenDto: PasswordResetTokenInfoDto): Promise<string>;

	/**
	 * Method for updating password reset token
	 * @param id - token id
	 * @param updateData - new token value and/or expiration date
	 * @returns true - if token was updated
	 * @returns false - if token wasn't updated
	 */
	updateToken(id: string, updateData: TUpdatePasswordResetToken): Promise<boolean>;

	/**
	 * Method for deleting reset password token
	 * @param id - token id
	 * @returns true - if token was deleted
	 * @returns false - if token wasn't deleted
	 */
	deleteToken(id: string): Promise<boolean>;
}
