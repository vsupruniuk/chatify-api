import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';

export interface IDirectChatsService {
	/**
	 * Method for creating direct chat with initial message
	 * @param createDirectChatDto - users information for creating chat and initial message
	 * @returns id of created chat
	 */
	createChat(createDirectChatDto: CreateDirectChatDto): Promise<string>;

	getChats(): Promise<string>;
}
