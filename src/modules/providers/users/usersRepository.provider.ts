import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { UsersRepository } from '@repositories';

export const usersRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_USERS_REPOSITORY,
	useClass: UsersRepository,
};
