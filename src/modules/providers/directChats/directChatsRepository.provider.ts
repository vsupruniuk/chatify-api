import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DirectChatsRepository } from '@Repositories/directChats.repository';

export const directChatsRepositoryProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_REPOSITORY_PROVIDER,
	useClass: DirectChatsRepository,
};
