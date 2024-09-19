import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';

export interface IDirectChatsService {
	/**
	 * Method for creating direct chat with initial message
	 * @param createDirectChatDto - users information for creating chat and initial message
	 * @returns id of created chat
	 */
	createChat(createDirectChatDto: CreateDirectChatDto): Promise<string>;

	/**
	 * Retrieve last direct chat, decrypt their last messages and return in public form
	 * @param page - page of records
	 * @param take - number of records to take
	 * @param userId - user id for retrieving chats
	 * @returns DirectChatShortDto[] - array of direct chats with decrypted messages and without sensitive data
	 */
	getLastChats(userId: string, page?: number, take?: number): Promise<DirectChatShortDto[]>;

	/**
	 * Retrieve chat messages
	 * @param userId - user id that send request for messages
	 * @param directChatId - chat id to get messages
	 * @param page - page of records
	 * @param take - number of records to take
	 * @returns DirectChatMessageWithChatDto decrypted chat messages
	 */
	getChatMessages(
		userId: string,
		directChatId: string,
		page?: number,
		take?: number,
	): Promise<DirectChatMessageWithChatDto[]>;
}
