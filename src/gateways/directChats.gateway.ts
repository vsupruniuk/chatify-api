import { CustomProviders } from '@Enums/CustomProviders.enum';
import { WSEvents } from '@Enums/WSEvents.enum';
import { WsExceptionFilter } from '@Filters/WsException.filter';
import { IDirectChatsGateway } from '@Interfaces/directChats/IDirectChatsGateway';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@UsePipes(
	new ValidationPipe({
		whitelist: true,
		stopAtFirstError: false,
	}),
)
@UseFilters(WsExceptionFilter)
@WebSocketGateway()
export class DirectChatsGateway
	implements IDirectChatsGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() private readonly _server: Server;
	private readonly _clients: Map<string, Socket> = new Map();

	constructor(
		@Inject(CustomProviders.I_DIRECT_CHATS_SERVICE_PROVIDER)
		private readonly _directChatsService: IDirectChatsService,
	) {}

	public afterInit(): void {
		console.log(`${DirectChatsGateway.name} is ready to listening events`);
	}

	public handleConnection(client: Socket): void {
		console.log(client.id);
	}

	public handleDisconnect(client: Socket): void {
		console.log(client.id);
	}

	@SubscribeMessage(WSEvents.CREATE_CHAT)
	async createDirectChat(): Promise<WsResponse> {
		this._directChatsService.createChat();

		return {
			event: WSEvents.ON_CREATE_CHAT,
			data: 'Success',
		};
	}
}
