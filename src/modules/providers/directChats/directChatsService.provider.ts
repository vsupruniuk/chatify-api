import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DirectChatsService } from '@Services/directChats.service';

export const directChatsServiceProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_SERVICE_PROVIDER,
	useClass: DirectChatsService,
};
