import { ClassProvider } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { UsersRepository } from '@repositories/users/users.repository';

export const usersRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_USERS_REPOSITORY,
	useClass: UsersRepository,
};
