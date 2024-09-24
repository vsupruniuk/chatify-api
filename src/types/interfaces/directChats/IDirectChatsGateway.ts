import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { WsResponse } from '@nestjs/websockets';
import { WSResponseResult } from '@Responses/WSResponseResult';
import { JWTPayloadDto } from '@DTO/JWTTokens/JWTPayload.dto';

/**
 * Interface representing public methods of direct chats gateway
 */
export interface IDirectChatsGateway {
	/**
	 * Event handler responsible for creating direct chat with initial message with another user
	 * @param createDirectChatDto - initial messages and users id's for creating chat
	 * @returns successful response with created chat id
	 */
	createDirectChat(createDirectChatDto: CreateDirectChatDto): Promise<WsResponse<WSResponseResult>>;

	sendMessage(appUserPayload: JWTPayloadDto): Promise<WsResponse<string>>;
}
