import { JwtPayloadDto } from '@dtos/jwt';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

import { PaginationTypes } from '@customTypes';

export interface IDirectChatsController {
	/**
	 * Retrieve user last direct chats
	 * @param appUserPayload - user data from access token
	 * @param page - page number of records
	 * @param take - number of records to retrieve
	 * @returns DirectChatWithUsersAndMessagesDto - user last chats
	 */
	getLastChats(
		appUserPayload: JwtPayloadDto,
		pagination: PaginationTypes.IPagination,
	): Promise<DirectChatWithUsersAndMessagesDto[]>;

	/**
	 * Retrieve chat messages
	 * @param appUserPayload - user data from access token
	 * @param chatId - chat id for retrieving messages
	 * @param page - page number of records
	 * @param take - number of record to retrieve
	 * @returns DirectChatMessageWithChatAndUserDto - direct chat last messages
	 */
	getChatMessages(
		appUserPayload: JwtPayloadDto,
		chatId: string,
		pagination: PaginationTypes.IPagination,
	): Promise<DirectChatMessageWithChatAndUserDto[]>;
}
