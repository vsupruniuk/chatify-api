import { CustomProviders } from '@enums/CustomProviders.enum';
import { DirectChatsRepository } from '@repositories/directChats/directChats.repository';
import { ClassProvider } from '@nestjs/common';

export const directChatsRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_REPOSITORY,
	useClass: DirectChatsRepository,
};
