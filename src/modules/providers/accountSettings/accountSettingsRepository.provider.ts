import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';

export const accountSettingsRepositoryProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY,
	useClass: AccountSettingsRepository,
};
