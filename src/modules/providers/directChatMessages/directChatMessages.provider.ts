import { ClassProvider } from '@nestjs/common';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DirectChatMessagesRepository } from '@Repositories/directChatMessages.repository';

export const directChatMessagesProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
	useClass: DirectChatMessagesRepository,
};
