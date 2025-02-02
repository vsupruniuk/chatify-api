import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';

export interface IDirectChatMessagesRepository {
	/**
	 * Get last messages for direct chat
	 * @param userId - user id that send request for messages
	 * @param directChatId - id of chat for retrieving messages
	 * @param skip - number of records to skip
	 * @param take - number of records to take
	 * @throws UnprocessableEntityException - if chat not belongs to this user
	 */
	getChatMessages(
		userId: string,
		directChatId: string,
		skip: number,
		take: number,
	): Promise<DirectChatMessage[]>;

	/**
	 * Create message for direct chat
	 * @param senderId - id of user that send message
	 * @param directChatId - id of chat to create message
	 * @param messageText - message text to send
	 * @param messageDateTime - message date and times
	 * @throws NotFoundException - if message sender or chat not found
	 * @returns created chat id
	 */
	createMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
		messageDateTime: string,
	): Promise<string>;

	/**
	 * Retrieve message by id
	 * @param messageId - message id for searching
	 * @returns DirectChatMessage | null
	 */
	getMessageById(messageId: string): Promise<DirectChatMessage | null>;
}
