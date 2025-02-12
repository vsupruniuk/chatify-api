export interface IDirectChatsController {
	// /**
	//  * Retrieve user last direct chats
	//  * @param appUserPayload - user data from access token
	//  * @param page - page number of records
	//  * @param take - number of records to retrieve
	//  * @returns DirectChatShortDto - user last chats
	//  */
	// getLastChats(
	// 	appUserPayload: JWTPayloadDto,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<DirectChatShortDto[]>;
	//
	// /**
	//  * Retrieve chat messages
	//  * @param appUserPayload - user data from access token
	//  * @param chatId - chat id for retrieving messages
	//  * @param page - page number of records
	//  * @param take - number of record to retrieve
	//  * @returns DirectChatMessageWithChatDto - direct chat last messages
	//  */
	// getChatMessages(
	// 	appUserPayload: JWTPayloadDto,
	// 	chatId: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<DirectChatMessageWithChatDto[]>;
}
