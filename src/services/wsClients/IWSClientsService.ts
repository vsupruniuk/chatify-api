import { Socket } from 'socket.io';

import { WSEvent } from '@enums';

/**
 * Service interface for actions with WebSocket clients
 */
export interface IWSClientsService {
	/**
	 * Set new socket connection to internal map
	 * @param userId - unique user id
	 * @param client - client connection object
	 */
	set(userId: string, client: Socket): void;

	/**
	 * Delete socket connection from internal map
	 * @param userId - unique user id
	 */
	delete(userId: string): void;

	/**
	 * Send a message to specific event for provided users if they are connected
	 * @param usersIds - array of user ids to notify
	 * @param event - name of the event
	 * @param data - data to send
	 * @template T - shape of data that will be sent to the clients
	 */
	notifyAllClients<T extends object>(usersIds: string[], event: WSEvent, data: T): void;
}
