import { CustomProviders } from '@enums/CustomProviders.enum';
import { ClassProvider } from '@nestjs/common';
import { AppUserService } from '@services/appUser/appUserService';

export const appUserServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_APP_USER_SERVICE,
	useClass: AppUserService,
};
