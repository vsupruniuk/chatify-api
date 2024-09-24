import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';

export interface IDirectChatsRepository {
	/**
	 * Creating direct chat between 2 users with initial message
	 * @param senderId - id of user which initialize this chat
	 * @param receiverId - id of receiver user
	 * @param messageText - initial message text
	 * @param messageDateTime - initial message date time
	 * @throws NotFoundException - thrown exception if failed to find one of users
	 * or failed to create direct chat
	 * @returns id - id of created chat
	 */
	createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
		messageDateTime: string,
	): Promise<string>;

	/**
	 * Get last user direct chats
	 * @param skip - number of records to skip
	 * @param take - number of records to take
	 * @param userId - user id in UUID format
	 * @returns DirectChat list
	 */
	getLastChats(userId: string, skip: number, take: number): Promise<DirectChat[]>;

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
}
