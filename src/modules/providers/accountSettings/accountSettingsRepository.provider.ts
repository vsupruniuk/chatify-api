import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { AccountSettingsRepository } from '@repositories';

export const accountSettingsRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_REPOSITORY,
	useClass: AccountSettingsRepository,
};
