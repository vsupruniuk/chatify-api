import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { AuthService } from '@services';

export const authServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_AUTH_SERVICE,
	useClass: AuthService,
};
