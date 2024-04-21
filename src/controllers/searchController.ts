import { AppUserPayload } from '@Decorators/AppUser.decorator';
import { QueryRequired } from '@Decorators/QueryRequired.decorator';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';
import { UserPublicDto } from '@DTO/users/UserPublic.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { AuthInterceptor } from '@Interceptors/auth.interceptor';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { ISearchController } from '@Interfaces/search/ISearchController';
import { IUsersService } from '@Interfaces/users/IUsersService';
import { AppLogger } from '@Logger/app.logger';
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
import { ResponseResult } from '@Responses/ResponseResult';
import { SuccessfulResponseResult } from '@Responses/successfulResponses/SuccessfulResponseResult';

@Controller('search')
@UseInterceptors(AuthInterceptor)
export class SearchController implements ISearchController {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(
		@Inject(CustomProviders.I_USERS_SERVICE)
		private readonly _usersService: IUsersService,
	) {}

	@Get('/find-users')
	@HttpCode(HttpStatus.OK)
	public async findUsers(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@QueryRequired('nickname') nickname: string,
		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
	): Promise<ResponseResult> {
		this._logger.incomingRequest({
			requestMethod: this.findUsers.name,
			controller: 'SearchController',
			queryParams: {
				nickname,
				page,
				take,
			},
		});

		const responseResult: SuccessfulResponseResult<UserPublicDto> =
			new SuccessfulResponseResult<UserPublicDto>(HttpStatus.OK, ResponseStatus.SUCCESS);

		responseResult.data = await this._usersService.getPublicUsers(nickname, page, take);
		responseResult.dataLength = responseResult.data.length;

		this._logger.successfulRequest({ code: responseResult.code, data: responseResult.data });

		return responseResult;
	}
}
