import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { AccountSettingsService } from '@services';

export const accountSettingsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE,
	useClass: AccountSettingsService,
};
