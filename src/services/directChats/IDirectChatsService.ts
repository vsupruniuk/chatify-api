import { CreateDirectChatResponseDto } from '@dtos/directChats/CreateDirectChatResponse.dto';

export interface IDirectChatsService {
	/**
	 * Method for handling create direct chat event
	 * @param senderId - id of user which sent the message
	 * @param receiverId - if of user who will receive the message
	 * @param messageText - text of the message
	 * @returns CreateDirectChatResponseDto - created chat
	 * @throws BadRequestException - if one of the users does not exist
	 * @throws ConflictException - if chat between users already exist
	 * @throws UnprocessableEntityException - if failed to create chat
	 */
	createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
	): Promise<CreateDirectChatResponseDto>;
	//
	// /**
	//  * Retrieve last direct chat, decrypt their last messages and return in public form
	//  * @param page - page of records
	//  * @param take - number of records to take
	//  * @param userId - user id for retrieving chats
	//  * @returns DirectChatShortDto[] - array of direct chats with decrypted messages and without sensitive data
	//  */
	// getLastChats(userId: string, page?: number, take?: number): Promise<DirectChatShortDto[]>;
	//
	// /**
	//  * Retrieve chat messages
	//  * @param userId - user id that send request for messages
	//  * @param directChatId - chat id to get messages
	//  * @param page - page of records
	//  * @param take - number of records to take
	//  * @returns DirectChatMessageWithChatDto decrypted chat messages
	//  */
	// getChatMessages(
	// 	userId: string,
	// 	directChatId: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<DirectChatMessageWithChatDto[]>;
	//
	// /**
	//  * Create message for direct chat and retrieve it back
	//  * @param senderId - id of user who send this message
	//  * @param directChatId - id of chat for creating message
	//  * @param messageText - message text to send
	//  * @throws UnprocessableEntityException - if failed to create message
	//  * @returns DirectChatMessageWithChatDto
	//  */
	// sendMessage(
	// 	senderId: string,
	// 	directChatId: string,
	// 	messageText: string,
	// ): Promise<DirectChatMessageWithChatDto>;
}
