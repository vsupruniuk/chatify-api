// @Controller('search')
// @UseInterceptors(AuthInterceptor)
// @UseInterceptors(TransformInterceptor)
// export class SearchController implements ISearchController {
// 	constructor(
// 		@Inject(CustomProviders.CTF_USERS_SERVICE)
// 		private readonly _usersService: IUsersService,
// 	) {}
//
// 	// TODO check if needed
// 	@Get('find-users')
// 	@HttpCode(HttpStatus.OK)
// 	public async findUsers(
// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
// 		@QueryRequired('nickname') nickname: string,
// 		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
// 		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
// 	): Promise<UserPublicDto[]> {
// 		return await this._usersService.getPublicUsers(appUserPayload.nickname, nickname, page, take);
// 	}
// }
