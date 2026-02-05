import { JwtPayloadDto } from '@dtos/jwt';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

import { PaginationTypes } from '@customTypes';

/**
 * Controller interface for direct chats HTTP requests
 */
export interface IDirectChatsController {
	/**
	 * Get user chats sorted by the time of last message
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param pagination - object with pagination query parameters
	 * @returns Promise<DirectChatWithUsersAndMessagesDto[]> - array of direct chats with users and last message
	 */
	getLastChats(
		appUserPayload: JwtPayloadDto,
		pagination: PaginationTypes.IPagination,
	): Promise<DirectChatWithUsersAndMessagesDto[]>;

	/**
	 * Get chat messages sorted by the time
	 * @param appUserPayload - payload retrieved from JWT access token
	 * @param chatId - id of the chat from query parameter
	 * @param pagination - objects with pagination query parameters
	 * @returns Promise<DirectChatMessageWithChatAndUserDto[]> - array of chat messages with related chat and user information
	 */
	getChatMessages(
		appUserPayload: JwtPayloadDto,
		chatId: string,
		pagination: PaginationTypes.IPagination,
	): Promise<DirectChatMessageWithChatAndUserDto[]>;
}
