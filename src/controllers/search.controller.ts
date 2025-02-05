import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { QueryRequired } from '@Decorators/QueryRequired.decorator';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { ISearchController } from '@Interfaces/search/ISearchController';
import { IUsersService } from '@Interfaces/users/IUsersService';
import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	ParseIntPipe,
	Query,
	UseInterceptors,
} from '@nestjs/common';
import { TransformInterceptor } from '@Interceptors/transform.interceptor';

@Controller('search')
@UseInterceptors(AuthInterceptor)
@UseInterceptors(TransformInterceptor)
export class SearchController implements ISearchController {
	constructor(
		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get('find-users')
	@HttpCode(HttpStatus.OK)
	public async findUsers(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@QueryRequired('nickname') nickname: string,
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<UserPublicDto[]> {
		return await this._usersService.getPublicUsers(appUserPayload.nickname, nickname, page, take);
	}
}
