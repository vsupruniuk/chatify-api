import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { DirectChatsService } from '@services';

export const directChatsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_DIRECT_CHATS_SERVICE,
	useClass: DirectChatsService,
};
