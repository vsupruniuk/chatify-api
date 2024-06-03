import { WSEvents } from '@Enums/WSEvents.enum';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

/**
 * Exception filter for handling websockets exceptions and errors in app.
 */
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
	catch(exception: WsException, host: ArgumentsHost) {
		const client = host.switchToWs().getClient();

		client.emit(WSEvents.ON_ERROR, {
			message: exception.message,
			status: exception.name,
		});
	}
}
