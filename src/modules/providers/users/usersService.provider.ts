import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { UsersService } from '@services';

export const usersServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_USERS_SERVICE,
	useClass: UsersService,
};
