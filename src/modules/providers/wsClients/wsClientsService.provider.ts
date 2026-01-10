import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { WsClientsService } from '@services';

export const wsClientsServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_WS_CLIENTS_SERVICE,
	useClass: WsClientsService,
};
