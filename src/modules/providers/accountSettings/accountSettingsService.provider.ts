import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AccountSettingsService } from '@Services/accountSettings.service';
import { ClassProvider } from '@nestjs/common';

export const accountSettingsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE,
	useClass: AccountSettingsService,
};
