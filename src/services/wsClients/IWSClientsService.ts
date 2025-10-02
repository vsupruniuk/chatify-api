import { Socket } from 'socket.io';

import { WSEvents } from '@enums';

export interface IWSClientsService {
	/**
	 * Set a connected client to private map
	 * @param userId - id of connected user
	 * @param client - client connection information
	 */
	set(userId: string, client: Socket): void;

	/**
	 * Delete disconnected user from the private map
	 * @param userId - id of disconnected user
	 */
	delete(userId: string): void;

	/**
	 * Format response data and notify each user if he is connected to the app
	 * @param usersIds - array of users ids to notify
	 * @param event - name of the event
	 * @param data - data for notification
	 */
	notifyAllClients<T extends object>(usersIds: string[], event: WSEvents, data: T): void;
}
