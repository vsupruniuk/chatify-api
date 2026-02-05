import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

/**
 * Service interface for actions with direct chat messages
 */
export interface IDirectChatMessagesService {
	/**
	 * Get array of chat messages, sorted from the newest to oldest
	 * @param userId - id of logged-in user that sent a request
	 * @param directChatId - id of chat to get messages
	 * @param page - number of pagination page
	 * @param take - number of records to take
	 * @returns Promise<DirectChatMessageWithChatAndUserDto[]> - array of found messages
	 * @throws NotFoundException - if chat with provided id does not exist
	 * @throws BadRequestException - if user is not a participant of the chat
	 */
	getChatMessages(
		userId: string,
		directChatId: string,
		page: number,
		take: number,
	): Promise<DirectChatMessageWithChatAndUserDto[]>;

	/**
	 * Creates new message in existing direct chat
	 * @param senderId - id of user who sent the message
	 * @param directChatId - id of chat where message should be created
	 * @param messageText - encrypted message text
	 * @returns Promise<DirectChatMessageWithChatAndUserDto> - created message with chat and related users
	 * @throws NotFoundException - if sender user or direct chat does not exist
	 * @throws UnprocessableEntityException - if failed to create message
	 */
	createMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
	): Promise<DirectChatMessageWithChatAndUserDto>;
}
