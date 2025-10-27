import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { ISearchController } from '@controllers';

import { UserDto } from '@dtos/users';

import { Pagination, QueryRequired } from '@decorators/data';

import { CustomProviders } from '@enums';

import { IUsersService } from '@services';
import { GlobalTypes } from '@customTypes';

@Controller('search')
@UseInterceptors(AuthInterceptor)
@UseInterceptors(ResponseTransformInterceptor)
export class SearchController implements ISearchController {
	constructor(
		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get('find-users')
	public async findUsers(
		@QueryRequired('nickname') nickname: string,

		@Pagination() pagination: GlobalTypes.IPagination,
	): Promise<UserDto[]> {
		return this._usersService.getActivatedUsersByNickname(
			nickname,
			pagination.page,
			pagination.take,
		);
	}
}
