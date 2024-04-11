import { CustomProviders } from '@Enums/CustomProviders.enum';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { Controller, Inject } from '@nestjs/common';

@Controller('search')
export class SearchController {
	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}
}
