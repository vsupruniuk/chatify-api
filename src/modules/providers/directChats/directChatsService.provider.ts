import { CustomProviders } from '@enums/CustomProviders.enum';
import { DirectChatsService } from '@services/directChats.service';
import { ClassProvider } from '@nestjs/common';

export const directChatsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_SERVICE,
	useClass: DirectChatsService,
};
