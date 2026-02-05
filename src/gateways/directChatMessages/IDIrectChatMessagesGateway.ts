import { JwtPayloadDto } from '@dtos/jwt';
import { CreateDirectChatMessageRequestDto } from '@dtos/directChatMessages';

/**
 * Gateway interface for live time action related to direct chat messages
 */
export interface IDirectChatMessagesGateway {
	/**
	 * Create a message in the chat and notify related users if they are connected
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param createDirectChatMessageRequestDto - DTO object with information for creating message for specific direct chat
	 */
	createMessage(
		appUserPayload: JwtPayloadDto,
		createDirectChatMessageRequestDto: CreateDirectChatMessageRequestDto,
	): Promise<void>;
}
