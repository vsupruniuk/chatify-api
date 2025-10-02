import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { UsersService } from '@services';

export const usersServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_USERS_SERVICE,
	useClass: UsersService,
};
