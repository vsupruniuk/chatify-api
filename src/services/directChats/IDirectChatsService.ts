import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

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
		page?: number,
		take?: number,
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
		page?: number,
		take?: number,
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
	sendMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
	): Promise<DirectChatMessageWithChatAndUserDto>;
}
