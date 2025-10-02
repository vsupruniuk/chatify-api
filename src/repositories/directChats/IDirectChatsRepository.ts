import { DirectChat } from '@entities';

import { UserDto } from '@dtos/users';

export interface IDirectChatsRepository {
	/**
	 * Retrieve direct chat by id
	 * @param id - chat id for searching
	 * @returns DirectChat - if direct chat was found
	 * @returns null - if direct chat was not found
	 */
	findById(id: string): Promise<DirectChat | null>;

	/**
	 * Retrieve direct chat with users by id
	 * @param id - chat id for searching
	 * @returns DirectChat - if direct chat was found
	 * @returns null - if direct chat was not found
	 */
	findByIdWithUsers(id: string): Promise<DirectChat | null>;

	/**
	 * Retrieve direct chat by both of its users
	 * @param firstUserId - first user id
	 * @param secondUserId - second user id
	 * @returns direct chat if it was found
	 * @returns null if direct chat wasn't found
	 */
	findByUsersIds(firstUserId: string, secondUserId: string): Promise<DirectChat | null>;

	/**
	 * Get last user direct chats
	 * @param userId - user id in UUID format
	 * @param skip - number of records to skip
	 * @param take - number of records to take
	 * @returns DirectChat list
	 */
	findLastChatsByUserId(userId: string, skip: number, take: number): Promise<DirectChat[]>;

	/**
	 * Creating direct chat between 2 users with initial message
	 * @param sender - user which initialize this chat
	 * @param receiver - receiver user
	 * @param messageText - initial message text
	 * @param messageDateTime - initial message date time
	 * @returns DirectChat - created chat
	 * @returns null - if failed to create chat
	 */
	createChat(
		sender: UserDto,
		receiver: UserDto,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChat | null>;
}
