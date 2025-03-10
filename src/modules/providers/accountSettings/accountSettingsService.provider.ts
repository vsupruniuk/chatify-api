import { CustomProviders } from '@enums/CustomProviders.enum';
import { AccountSettingsService } from '@services/accountSettings/accountSettings.service';
import { ClassProvider } from '@nestjs/common';

export const accountSettingsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE,
	useClass: AccountSettingsService,
};
