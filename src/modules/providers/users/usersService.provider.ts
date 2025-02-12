import { CustomProviders } from '@enums/CustomProviders.enum';
import { UsersService } from '@services/users/users.service';
import { ClassProvider } from '@nestjs/common';

export const usersServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_USERS_SERVICE,
	useClass: UsersService,
};
