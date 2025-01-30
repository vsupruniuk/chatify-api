import { CustomProviders } from '@Enums/CustomProviders.enum';
import { UsersService } from '@Services/users.service';

export const usersServiceProvider = {
	provide: CustomProviders.CTF_USERS_SERVICE,
	useClass: UsersService,
};
