import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { DirectChatsService } from '@services';

export const directChatsServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_DIRECT_CHATS_SERVICE,
	useClass: DirectChatsService,
};
