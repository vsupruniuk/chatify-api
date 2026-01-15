import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { AccountSettingsRepository } from '@repositories';

export const accountSettingsRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_ACCOUNT_SETTINGS_REPOSITORY,
	useClass: AccountSettingsRepository,
};
