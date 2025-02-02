import { DirectChat } from '@Entities/DirectChat.entity';

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
	 * Retrieve direct chat by id
	 * @param chatId - chat id for searching
	 * @returns DirectChat - if direct chat was found
	 * @returns null - if direct chat was not found
	 */
	getChatById(chatId: string): Promise<DirectChat | null>;

	/**
	 * Retrieve direct chat by both of its users
	 * @param firstUserId - first user id
	 * @param secondUserId - second user id
	 * @returns direct chat if it was found
	 * @returns null if direct chat wasn't found
	 */
	getChatByUsers(firstUserId: string, secondUserId: string): Promise<DirectChat | null>;
}
