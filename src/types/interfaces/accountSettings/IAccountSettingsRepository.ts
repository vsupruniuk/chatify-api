export interface IAccountSettingsRepository {
	createDefaultSettings(): Promise<string>;
}
