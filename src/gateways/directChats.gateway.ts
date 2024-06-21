import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { CreateDirectChatResponseDto } from '@DTO/directChat/CreateDirectChatResponse.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { ResponseStatus } from '@Enums/ResponseStatus.enum';
import { WSEvents } from '@Enums/WSEvents.enum';
import { wsExceptionFilter } from '@Filters/wsExceptionFilter';
import { IDirectChatsGateway } from '@Interfaces/directChats/IDirectChatsGateway';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { IJWTTokensService } from '@Interfaces/jwt/IJWTTokensService';
import { WsAuthMiddleware } from '@Middlewares/wsAuth.middleware';
import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsResponse,
} from '@nestjs/websockets';
import { SuccessfulWSResponseResult } from '@Responses/successfulResponses/SuccessfulWSResponseResult';
import { WSResponseResult } from '@Responses/WSResponseResult';
import { TUserPayload } from '@Types/users/TUserPayload';
import { Server, Socket } from 'socket.io';

@UsePipes(
	new ValidationPipe({
		whitelist: true,
		stopAtFirstError: false,
	}),
)
@UseFilters(wsExceptionFilter)
@WebSocketGateway()
export class DirectChatsGateway
	implements IDirectChatsGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() private readonly _server: Server;
	private readonly _clients: Map<string, Socket> = new Map();

	constructor(
		@Inject(CustomProviders.I_DIRECT_CHATS_SERVICE_PROVIDER)
		private readonly _directChatsService: IDirectChatsService,

		@Inject(CustomProviders.I_JWT_TOKENS_SERVICE)
		private readonly _jwtTokenService: IJWTTokensService,
	) {}

	public afterInit(@ConnectedSocket() client: Socket): void {
		client.use(WsAuthMiddleware(this._jwtTokenService));
		console.log(`${DirectChatsGateway.name} is ready to listening events`);
	}

	public handleConnection(@ConnectedSocket() client: Socket & TUserPayload): void {
		this._clients.set(client.user.id, client);

		console.log(`Client with user id: ${client.user.id} connected`);
		console.log(`Number of connected clients: ${this._server.sockets.sockets.size}`);
	}

	public handleDisconnect(@ConnectedSocket() client: Socket & TUserPayload): void {
		this._clients.delete(client.user.id);
	}

	@SubscribeMessage(WSEvents.CREATE_CHAT)
	async createDirectChat(
		@MessageBody() createDirectChatDto: CreateDirectChatDto,
	): Promise<WsResponse<WSResponseResult>> {
		const responseResult: SuccessfulWSResponseResult<CreateDirectChatResponseDto> =
			new SuccessfulWSResponseResult<CreateDirectChatResponseDto>(ResponseStatus.SUCCESS);

		const createdChatId: string = await this._directChatsService.createChat(createDirectChatDto);

		responseResult.data = { directChatId: createdChatId };

		const receiverClient: Socket | undefined = this._clients.get(createDirectChatDto.receiverId);

		if (receiverClient) {
			receiverClient.emit(WSEvents.ON_CREATE_CHAT, responseResult);
		}

		return {
			event: WSEvents.ON_CREATE_CHAT,
			data: responseResult,
		};
	}
}
