import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { DirectChatsRepository } from '@repositories';

export const directChatsRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_REPOSITORY,
	useClass: DirectChatsRepository,
};
