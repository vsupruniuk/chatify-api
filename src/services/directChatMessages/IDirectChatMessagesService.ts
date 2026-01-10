import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

export interface IDirectChatMessagesService {
	/**
	 * Retrieve chat messages
	 * @param userId - user id that send request for messages
	 * @param directChatId - chat id to get messages
	 * @param page - page of records
	 * @param take - number of records to take
	 * @returns DirectChatMessageWithChatAndUserDto - decrypted chat messages
	 * @throws NotFoundException - if chat with provided id does not exist
	 * @throws BadRequestException - if user does not belong to the chat
	 */
	getChatMessages(
		userId: string,
		directChatId: string,
		page: number,
		take: number,
	): Promise<DirectChatMessageWithChatAndUserDto[]>;

	/**
	 * Create message for direct chat and retrieve it back
	 * @param senderId - id of user who send this message
	 * @param directChatId - id of chat for creating message
	 * @param messageText - message text to send
	 * @returns DirectChatMessageWithChatAndUserDto - created message
	 * @throws NotFoundException - if message sender or chat is not found
	 * @throws UnprocessableEntityException - if failed to create a message
	 */
	createMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
	): Promise<DirectChatMessageWithChatAndUserDto>;
}
