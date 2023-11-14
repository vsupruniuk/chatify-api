/**
 * Interface representing public methods of account settings repository
 */
export interface IAccountSettingsRepository {
	/**
	 * Method for creating default account settings for user
	 * @returns id - of created settings
	 */
	createDefaultSettings(): Promise<string>;
}
