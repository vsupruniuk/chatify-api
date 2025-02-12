// @Controller('direct-chats')
// @UseInterceptors(AuthInterceptor)
// @UseInterceptors(TransformInterceptor)
// export class DirectChatsController implements IDirectChatsController {
// 	constructor(
// 		@Inject(CustomProviders.CTF_DIRECT_CHATS_SERVICE)
// 		private readonly _directChatsService: IDirectChatsService,
// 	) {}
//
// 	// TODO check if needed
// 	@Get()
// 	@HttpCode(HttpStatus.OK)
// 	public async getLastChats(
// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
// 		@Query('page', new ParseIntPipe({ optional: true })) page?: number,
// 		@Query('take', new ParseIntPipe({ optional: true })) take?: number,
// 	): Promise<DirectChatShortDto[]> {
// 		return await this._directChatsService.getLastChats(appUserPayload.id, page, take);
// 	}
//
// 	// TODO check if needed
// 	@Get('chat-messages')
// 	@HttpCode(HttpStatus.OK)
// 	public async getChatMessages(
// 		@AppUserPayload() appUserPayload: JWTPayloadDto,
// 		@QueryRequired('chatId') chatId: string,
// 		page?: number,
// 		take?: number,
// 	): Promise<DirectChatMessageWithChatDto[]> {
// 		return await this._directChatsService.getChatMessages(appUserPayload.id, chatId, page, take);
// 	}
// }
