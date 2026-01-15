import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

export interface IDirectChatsService {
	/**
	 * Retrieve last direct chat, decrypt their last messages and return in public form
	 * @param page - page of records
	 * @param take - number of records to take
	 * @param userId - user id for retrieving chats
	 * @returns DirectChatWithUsersAndMessagesDto - array of direct chats with decrypted messages and without sensitive data
	 */
	getUserLastChats(
		userId: string,
		page: number,
		take: number,
	): Promise<DirectChatWithUsersAndMessagesDto[]>;

	/**
	 * Method for handling create direct chat event
	 * @param senderId - id of user which sent the message
	 * @param receiverId - if of user who will receive the message
	 * @param messageText - text of the message
	 * @returns DirectChatWithUsersAndMessagesDto - created chat
	 * @throws BadRequestException - if one of the users does not exist
	 * @throws ConflictException - if chat between users already exist
	 * @throws UnprocessableEntityException - if failed to create chat
	 */
	createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
	): Promise<DirectChatWithUsersAndMessagesDto>;
}
