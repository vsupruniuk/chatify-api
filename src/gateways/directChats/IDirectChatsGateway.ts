import { JWTPayloadDto } from '@dtos/jwt';
import { CreateDirectChatRequestDto } from '@dtos/directChats';
import { SendDirectChatMessageRequestDto } from '@dtos/directChatMessages';

/**
 * Interface representing public methods of direct chats gateway
 */
export interface IDirectChatsGateway {
	/**
	 * Event handler for creating direct chat
	 * @param appUserPayload - sender user payload from access token
	 * @param createDirectChatRequestDto - receiver id and initial message
	 */
	createDirectChat(
		appUserPayload: JWTPayloadDto,
		createDirectChatRequestDto: CreateDirectChatRequestDto,
	): Promise<void>;

	/**
	 * Event handler responsible for creating message for direct chat and informing message receiver about it
	 * @param appUserPayload - user information from access token
	 * @param sendDirectChatMessageRequestDto - message text and chat id for sending message
	 * @returns successful response with created message
	 */
	sendMessage(
		appUserPayload: JWTPayloadDto,
		sendDirectChatMessageRequestDto: SendDirectChatMessageRequestDto,
	): Promise<void>;
}
