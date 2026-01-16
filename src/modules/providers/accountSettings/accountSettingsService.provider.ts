import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { AccountSettingsService } from '@services';

export const accountSettingsServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_ACCOUNT_SETTINGS_SERVICE,
	useClass: AccountSettingsService,
};
