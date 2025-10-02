import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { WsClientsService } from '@services';

export const wsClientsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_WS_CLIENTS_SERVICE,
	useClass: WsClientsService,
};
