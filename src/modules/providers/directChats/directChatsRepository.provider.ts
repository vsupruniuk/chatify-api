import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { DirectChatsRepository } from '@repositories';

export const directChatsRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_DIRECT_CHATS_REPOSITORY,
	useClass: DirectChatsRepository,
};
