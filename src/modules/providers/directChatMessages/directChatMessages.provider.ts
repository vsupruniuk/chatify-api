import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { DirectChatMessagesRepository } from '@repositories';

export const directChatMessagesProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
	useClass: DirectChatMessagesRepository,
};
