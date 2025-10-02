import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { UsersRepository } from '@repositories';

export const usersRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_USERS_REPOSITORY,
	useClass: UsersRepository,
};
