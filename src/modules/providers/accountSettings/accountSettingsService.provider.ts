import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AccountSettingsService } from '@Services/accountSettings.service';

export const accountSettingsServiceProvider = {
	provide: CustomProviders.CTF_ACCOUNT_SETTINGS_SERVICE,
	useClass: AccountSettingsService,
};
