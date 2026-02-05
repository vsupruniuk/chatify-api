import { DirectChat } from '@entities';

import { UserDto } from '@dtos/users';

/**
 * Repository interface for database action with direct chats
 */
export interface IDirectChatsRepository {
	/**
	 * Search a direct chat by the id
	 * @param id - chat id for searching
	 * @returns Promise<DirectChat | null> - chat found by the id or null
	 */
	findById(id: string): Promise<DirectChat | null>;

	/**
	 * Search a direct chat with users by the id
	 * @param id - chat id for searching
	 * @returns Promise<DirectChat | null> - chat found by the id together with users or null
	 */
	findByIdWithUsers(id: string): Promise<DirectChat | null>;

	/**
	 * Search a direct chat between two users by their id
	 * @param firstUserId - id of the first user to search
	 * @param secondUserId - id of the second user to search
	 * @returns Promise<DirectChat | null> - found direct chat or null
	 */
	findByUsersIds(firstUserId: string, secondUserId: string): Promise<DirectChat | null>;

	/**
	 * Search all user chats by its id, sorted by the time of last message, from newest to oldest
	 * @param userId - user id to search chats
	 * @param skip - number of records to skip
	 * @param take - number of records to take
	 * @returns Promise<DirectChat[]> - array of found direct chats
	 */
	findLastChatsByUserId(userId: string, skip: number, take: number): Promise<DirectChat[]>;

	/**
	 * Creates a chat between two users with initial message
	 * @param sender - DTO object wih sender user data
	 * @param receiver - DTO object with receiver user data
	 * @param messageText - initial message encrypted text
	 * @param messageDateTime - initial message creation time
	 * @remarks Methods using a transaction. In case if any operation in database will fail, all other will not be applied
	 */
	createChat(
		sender: UserDto,
		receiver: UserDto,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChat | null>;
}
