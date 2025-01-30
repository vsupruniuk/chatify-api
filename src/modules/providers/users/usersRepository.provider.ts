import { CustomProviders } from '@Enums/CustomProviders.enum';
import { UsersRepository } from '@Repositories/users.repository';

export const usersRepositoryProvider = {
	provide: CustomProviders.CTF_USERS_REPOSITORY,
	useClass: UsersRepository,
};
