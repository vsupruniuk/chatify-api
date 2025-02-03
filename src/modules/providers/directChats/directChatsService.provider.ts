import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DirectChatsService } from '@Services/directChats.service';
import { ClassProvider } from '@nestjs/common';

export const directChatsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_SERVICE,
	useClass: DirectChatsService,
};
