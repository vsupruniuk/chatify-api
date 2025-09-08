import { Controller, Get, Inject, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { AuthInterceptor } from '@interceptors/auth.interceptor';
import { ISearchController } from '@controllers/search/ISearchController';
import { ResponseTransformInterceptor } from '@interceptors/responseTransform.interceptor';
import { UserDto } from '@dtos/users/UserDto';
import { QueryRequired } from '@decorators/data/QueryRequired.decorator';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IUsersService } from '@services/users/IUsersService';

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
