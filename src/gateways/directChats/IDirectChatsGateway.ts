import { JwtPayloadDto } from '@dtos/jwt';
import { CreateDirectChatRequestDto } from '@dtos/directChats';

/**
 * Gateway interface for live time action related to direct chats
 */
export interface IDirectChatsGateway {
	/**
	 * Create a direct chat between two users with initial message and notify both users if they are connected
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param createDirectChatRequestDto - DTO object with information for creating direct chat
	 */
	createDirectChat(
		appUserPayload: JwtPayloadDto,
		createDirectChatRequestDto: CreateDirectChatRequestDto,
	): Promise<void>;
}
