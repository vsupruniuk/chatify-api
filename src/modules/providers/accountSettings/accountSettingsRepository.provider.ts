import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { ClassProvider } from '@nestjs/common';

export const accountSettingsRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY,
	useClass: AccountSettingsRepository,
};
