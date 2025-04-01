import { ClassProvider } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { WsClientsService } from '@services/wsClients/wsClients.service';

export const wsClientsServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_WS_CLIENTS_SERVICE,
	useClass: WsClientsService,
};
