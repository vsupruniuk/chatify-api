import { Socket } from 'socket.io';
import { IWSClientsService } from '@services/wsClients/IWSClientsService';
import { Injectable } from '@nestjs/common';
import { WSEvents } from '@enums/WSEvents.enum';
import { SuccessfulWSResponseResult } from '@responses/successfulResponses/SuccessfulWSResponseResult';
import { ResponseStatus } from '@enums/ResponseStatus.enum';

@Injectable()
export class WsClientsService implements IWSClientsService {
	private readonly _clients: Map<string, Socket> = new Map();

	public set(userId: string, client: Socket): void {
		this._clients.set(userId, client);
	}

	public delete(userId: string): void {
		this._clients.delete(userId);
	}

	public async notifyAllClients<T extends object>(
		usersIds: string[],
		event: WSEvents,
		data: T,
	): Promise<void> {
		const responseResult: SuccessfulWSResponseResult<T> = new SuccessfulWSResponseResult<T>(
			ResponseStatus.SUCCESS,
		);

		responseResult.data = data;

		usersIds.forEach((id: string) => {
			const client: Socket | undefined = this._clients.get(id);

			if (client) {
				client.emit(event, responseResult);
			}
		});
	}
}
