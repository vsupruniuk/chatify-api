import { UpdateAccountSettingsDto } from '@DTO/accountSettings/updateAccountSettings.dto';
import { AccountSettings } from '@Entities/AccountSettings.entity';

/**
 * Interface representing public methods of account settings repository
 */
export interface IAccountSettingsRepository {
	/**
	 * Method for searching user account settings by id
	 * @param id - id for searching
	 * @returns AccountSettings - if account settings were found
	 * @returns null - if account settings weren't found
	 */
	getById(id: string): Promise<AccountSettings | null>;

	/**
	 * Method for creating default account settings for user
	 * @returns id - of created settings
	 */
	createDefaultSettings(): Promise<string>;

	/**
	 * Method for updating user account settings
	 * @param id - id of user account settings
	 * @param newSettings - new settings for user account
	 * @returns true - if settings was updated
	 * @returns false - if settings wasn't updated
	 */
	updateAccountSettings(
		id: string,
		newSettings: Partial<UpdateAccountSettingsDto>,
	): Promise<boolean>;
}
