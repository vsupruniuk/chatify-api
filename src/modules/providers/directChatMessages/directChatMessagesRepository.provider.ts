import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { DirectChatMessagesRepository } from '@repositories';

export const directChatMessagesRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
	useClass: DirectChatMessagesRepository,
};
