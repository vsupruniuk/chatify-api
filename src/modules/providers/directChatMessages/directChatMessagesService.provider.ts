import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { DirectChatMessagesService } from '@services';

export const directChatMessagesServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_DIRECT_CHAT_MESSAGES_SERVICE,
	useClass: DirectChatMessagesService,
};
