import { CustomProviders } from '@Enums/CustomProviders.enum';
import { UsersService } from '@Services/users.service';
import { ClassProvider } from '@nestjs/common';

export const usersServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_USERS_SERVICE,
	useClass: UsersService,
};
