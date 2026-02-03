import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

/**
 * Service interface for actions with direct chats
 */
export interface IDirectChatsService {
	/**
	 * Get user direct chats, sorted by latest message, from the newest to oldest
	 * @param userId - id of user who sent the request
	 * @param page - number of pagination page
	 * @param take - number of records to take
	 * @returns Promise<DirectChatWithUsersAndMessagesDto[]> - array of found chat
	 */
	getUserLastChats(
		userId: string,
		page: number,
		take: number,
	): Promise<DirectChatWithUsersAndMessagesDto[]>;

	/**
	 * Creates a new chat between two users with initial message
	 * @param senderId - id of user who sent an email
	 * @param receiverId - id of second chat participant
	 * @param messageText - encrypted message text
	 * @returns Promise<DirectChatWithUsersAndMessagesDto> - created chat with initial message and users
	 * @throws BadRequestException - if some of the users does not exist
	 * @throws ConflictException - if direct chat between users already exist
	 * @throws UnprocessableEntityException - if failed to create direct chat
	 */
	createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
	): Promise<DirectChatWithUsersAndMessagesDto>;
}
