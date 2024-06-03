import { WsResponse } from '@nestjs/websockets';

/**
 * Interface representing public methods of direct chats gateway
 */
export interface IDirectChatsGateway {
	/**
	 * Event handler responsible for creating direct chat with initial message with another user
	 */
	createDirectChat(): Promise<WsResponse>;
}
