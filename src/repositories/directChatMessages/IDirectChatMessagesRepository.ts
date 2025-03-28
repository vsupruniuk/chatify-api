import { DirectChat } from '@entities/DirectChat.entity';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { UserDto } from '@dtos/users/UserDto';

export interface IDirectChatMessagesRepository {
	/**
	 * Create message for direct chat
	 * @param sender - user that sent a message
	 * @param directChat - direct chat related to message
	 * @param messageText - message text to send
	 * @param messageDateTime - message date and times
	 * @returns DirectChatMessage - created message with related chat if message was created
	 * @returns null - if message wasn't created
	 */
	createMessage(
		sender: UserDto,
		directChat: DirectChat,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChatMessage | null>;

	// /**
	//  * Get last messages for direct chat
	//  * @param userId - user id that send request for messages
	//  * @param directChatId - id of chat for retrieving messages
	//  * @param skip - number of records to skip
	//  * @param take - number of records to take
	//  * @throws UnprocessableEntityException - if chat not belongs to this user
	//  */
	// getChatMessages(
	// 	userId: string,
	// 	directChatId: string,
	// 	skip: number,
	// 	take: number,
	// ): Promise<DirectChatMessage[]>;
	//

	//
	// /**
	//  * Retrieve message by id
	//  * @param messageId - message id for searching
	//  * @returns DirectChatMessage | null
	//  */
	// getMessageById(messageId: string): Promise<DirectChatMessage | null>;
}
