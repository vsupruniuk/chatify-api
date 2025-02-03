import { CustomProviders } from '@Enums/CustomProviders.enum';
import { UsersRepository } from '@Repositories/users.repository';
import { ClassProvider } from '@nestjs/common';

export const usersRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_USERS_REPOSITORY,
	useClass: UsersRepository,
};
