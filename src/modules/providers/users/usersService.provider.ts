import { CustomProviders } from '@Enums/CustomProviders.enum';
import { UsersService } from '@Services/users.service';

export const usersServiceProvider = {
	provide: CustomProviders.I_USERS_SERVICE,
	useClass: UsersService,
};
