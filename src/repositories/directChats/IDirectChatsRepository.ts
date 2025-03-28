import { DirectChat } from '@entities/DirectChat.entity';
import { UserDto } from '@dtos/users/UserDto';

export interface IDirectChatsRepository {
	/**
	 * Retrieve direct chat by id
	 * @param id - chat id for searching
	 * @returns DirectChat - if direct chat was found
	 * @returns null - if direct chat was not found
	 */
	getById(id: string): Promise<DirectChat | null>;

	/**
	 * Retrieve direct chat by both of its users
	 * @param firstUserId - first user id
	 * @param secondUserId - second user id
	 * @returns direct chat if it was found
	 * @returns null if direct chat wasn't found
	 */
	getByUsersIds(firstUserId: string, secondUserId: string): Promise<DirectChat | null>;

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
	//
	// /**
	//  * Get last user direct chats
	//  * @param skip - number of records to skip
	//  * @param take - number of records to take
	//  * @param userId - user id in UUID format
	//  * @returns DirectChat list
	//  */
	// getLastChats(userId: string, skip: number, take: number): Promise<DirectChat[]>;
	//
}
