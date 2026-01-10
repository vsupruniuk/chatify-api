import { Controller, Get, Inject, UseInterceptors } from '@nestjs/common';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { ISearchController } from '@controllers';

import { UserDto } from '@dtos/users';

import { Pagination, QueryRequired } from '@decorators/data';

import { CustomProvider, QueryParam, Route } from '@enums';

import { IUsersService } from '@services';

import { PaginationTypes } from '@customTypes';

@Controller(Route.SEARCH)
@UseInterceptors(AuthInterceptor, ResponseTransformInterceptor)
export class SearchController implements ISearchController {
	constructor(
		@Inject(CustomProvider.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get(Route.FIND_USERS)
	public async findUsers(
		@QueryRequired(QueryParam.NICKNAME) nickname: string,
		@Pagination() pagination: PaginationTypes.IPagination,
	): Promise<UserDto[]> {
		return this._usersService.getActivatedUsersByNickname(
			nickname,
			pagination.page,
			pagination.take,
		);
	}
}
