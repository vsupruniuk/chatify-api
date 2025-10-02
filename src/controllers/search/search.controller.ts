import { Controller, Get, Inject, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';

import { AuthInterceptor, ResponseTransformInterceptor } from '@interceptors';

import { ISearchController } from '@controllers';

import { UserDto } from '@dtos/users';

import { QueryRequired } from '@decorators/data';

import { CustomProviders } from '@enums';

import { IUsersService } from '@services';

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

		@Query('page', new ParseIntPipe({ optional: true })) page?: number,

		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<UserDto[]> {
		return this._usersService.getActivatedUsersByNickname(nickname, page, take);
	}
}
