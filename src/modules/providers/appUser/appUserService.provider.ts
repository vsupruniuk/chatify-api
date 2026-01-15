import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { AppUserService } from '@services';

export const appUserServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_APP_USER_SERVICE,
	useClass: AppUserService,
};
