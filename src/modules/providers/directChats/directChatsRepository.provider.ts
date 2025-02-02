import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { ClassProvider } from '@nestjs/common';

export const directChatsRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_REPOSITORY,
	useClass: DirectChatsRepository,
};
