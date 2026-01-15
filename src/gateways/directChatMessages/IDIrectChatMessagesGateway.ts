import { JwtPayloadDto } from '@dtos/jwt';
import { CreateDirectChatMessageRequestDto } from '@dtos/directChatMessages';

export interface IDirectChatMessagesGateway {
	/**
	 * Event handler responsible for creating message for direct chat and informing message receiver about it
	 * @param appUserPayload - user information from access token
	 * @param sendDirectChatMessageRequestDto - message text and chat id for sending message
	 * @returns successful response with created message
	 */
	createMessage(
		appUserPayload: JwtPayloadDto,
		createDirectChatMessageRequestDto: CreateDirectChatMessageRequestDto,
	): Promise<void>;
}
