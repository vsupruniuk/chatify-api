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
	 * @returns DirectChat list
	 */
	getChats(skip: number, take: number, userId: string): Promise<DirectChat[]>;
}
