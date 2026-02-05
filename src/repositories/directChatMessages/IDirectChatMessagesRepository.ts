import { DirectChat, DirectChatMessage } from '@entities';

import { UserDto } from '@dtos/users';

/**
 * Repository interface for direct chat messages operations in database
 */
export interface IDirectChatMessagesRepository {
	/**
	 * Get and return direct chat messages, sorted from the newest to oldest
	 * @param directChatId - id of direct chat for which query messages
	 * @param skip - number of records to skip from query
	 * @param take - number of records to take in query
	 * @returns Promise<DirectChatMessage[]> - array of direct chat messages with information about sender, direct chat and it's users
	 */
	findLastMessagesByDirectChatId(
		directChatId: string,
		skip: number,
		take: number,
	): Promise<DirectChatMessage[]>;

	/**
	 * Create a new message in direct chat between two users
	 * @param sender - DTO object with sender user information
	 * @param directChat - direct chat where new message should be created
	 * @param messageText - new message encrypted text
	 * @param messageDateTime - date and time when the message was created
	 * @returns Promise<DirectChatMessage | null> - created direct chat message with the sender, direct chat and it's users
	 * @remarks Method using transaction. In case if any operation with DB will fail, all other will not be applied
	 */
	createMessage(
		sender: UserDto,
		directChat: DirectChat,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChatMessage | null>;
}
