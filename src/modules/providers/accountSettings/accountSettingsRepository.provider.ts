import { CustomProviders } from '@enums/CustomProviders.enum';
import { AccountSettingsRepository } from '@repositories/accountSettings/accountSettings.repository';
import { ClassProvider } from '@nestjs/common';

export const accountSettingsRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY,
	useClass: AccountSettingsRepository,
};
