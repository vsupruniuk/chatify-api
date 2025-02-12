/**
 * Interface representing public methods of direct chats gateway
 */
export interface IDirectChatsGateway {
	// /**
	//  * Event handler responsible for creating direct chat with initial message with another user
	//  * @param appUserPayload - user information from access token
	//  * @param createDirectChatDto - initial messages and users id's for creating chat
	//  * @returns successful response with created chat id
	//  */
	// createDirectChat(
	// 	appUserPayload: JWTPayloadDto,
	// 	createDirectChatDto: CreateDirectChatDto,
	// ): Promise<WsResponse<WSResponseResult>>;
	//
	// /**
	//  * Event handler responsible for creating message for direct chat and informing message receiver about it
	//  * @param appUserPayload - user information from access token
	//  * @param sendDirectMessageDto - message text and chat id for sending message
	//  * @returns successful response with created message
	//  */
	// sendMessage(
	// 	appUserPayload: JWTPayloadDto,
	// 	sendDirectMessageDto: SendDirectMessageDto,
	// ): Promise<WsResponse<WSResponseResult>>;
}
