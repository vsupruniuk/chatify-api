import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { AppUserService } from '@services';

export const appUserServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_APP_USER_SERVICE,
	useClass: AppUserService,
};
