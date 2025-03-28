import { ClassProvider } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { DirectChatMessagesRepository } from '@repositories/directChatMessages/directChatMessages.repository';

export const directChatMessagesProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
	useClass: DirectChatMessagesRepository,
};
