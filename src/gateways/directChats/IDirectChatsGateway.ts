import { JwtPayloadDto } from '@dtos/jwt';
import { CreateDirectChatRequestDto } from '@dtos/directChats';

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
		appUserPayload: JwtPayloadDto,
		createDirectChatRequestDto: CreateDirectChatRequestDto,
	): Promise<void>;
}
