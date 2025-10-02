import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { AuthService } from '@services';

export const authServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_AUTH_SERVICE,
	useClass: AuthService,
};
