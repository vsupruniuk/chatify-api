// @Injectable()
// export class AuthInterceptor implements NestInterceptor {
// 	constructor(
// 		@Inject(CustomProviders.CTF_JWT_TOKENS_SERVICE)
// 		private readonly _jwtTokensService: IJWTTokensService,
// 	) {}
//
// 	public async intercept(
// 		context: ExecutionContext,
// 		next: CallHandler,
// 	): Promise<Observable<unknown>> {
// 		const request: Request & TUserPayload = context.switchToHttp().getRequest();
//
// 		const authHeader: string | undefined = request.headers.authorization;
//
// 		if (!authHeader) {
// 			throw new UnauthorizedException(['Please, login to perform this action']);
// 		}
//
// 		const [, accessToken]: string[] = authHeader.split(' ');
//
// 		if (!accessToken) {
// 			throw new UnauthorizedException(['Please, login to perform this action']);
// 		}
//
// 		const userData: JWTPayloadDto | null =
// 			await this._jwtTokensService.verifyAccessToken(accessToken);
//
// 		if (!userData) {
// 			throw new UnauthorizedException(['Please, login to perform this action']);
// 		}
//
// 		request.user = userData;
//
// 		return next.handle();
// 	}
// }
