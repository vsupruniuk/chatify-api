import { DirectChat, DirectChatMessage } from '@entities';

import { UserDto } from '@dtos/users';

export interface IDirectChatMessagesRepository {
	/**
	 * Get last messages for direct chat
	 * @param directChatId - id of chat for retrieving messages
	 * @param skip - number of records to skip
	 * @param take - number of records to take
	 */
	findLastMessagesByDirectChatId(
		directChatId: string,
		skip: number,
		take: number,
	): Promise<DirectChatMessage[]>;

	/**
	 * Create message for direct chat
	 * @param sender - user that sent a message
	 * @param directChat - direct chat related to message
	 * @param messageText - message text to send
	 * @param messageDateTime - message date and times
	 * @returns DirectChatMessage - created message with related chat if message was created
	 * @returns null - if message wasn't created
	 */
	createMessage(
		sender: UserDto,
		directChat: DirectChat,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChatMessage | null>;
}
