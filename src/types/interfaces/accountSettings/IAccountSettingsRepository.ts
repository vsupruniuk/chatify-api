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
}
