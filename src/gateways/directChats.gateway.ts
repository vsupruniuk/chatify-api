import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IDirectChatsGateway } from '@interfaces/directChats/IDirectChatsGateway';
import { wsExceptionFilter } from '@filters/wsException.filter';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsService } from '@interfaces/directChats/IDirectChatsService';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { TUserPayload } from '@custom-types/users/TUserPayload';

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
		@Inject(CustomProviders.CTF_DIRECT_CHATS_SERVICE)
		private readonly _directChatsService: IDirectChatsService,

		@Inject(CustomProviders.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokenService: IJWTTokensService,
	) {}

	public afterInit(@ConnectedSocket() client: Socket): void {
		console.log(client.id);
		// client.use(WsAuthMiddleware(this._jwtTokenService));
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

	// // TODO check if needed
	// @SubscribeMessage(WSEvents.CREATE_CHAT)
	// public async createDirectChat(
	// 	@AppUserPayload() appUserPayload: JWTPayloadDto,
	// 	@MessageBody() createDirectChatDto: CreateDirectChatDto,
	// ): Promise<WsResponse<WSResponseResult>> {
	// 	const responseResult: SuccessfulWSResponseResult<CreateDirectChatResponseDto> =
	// 		new SuccessfulWSResponseResult<CreateDirectChatResponseDto>(ResponseStatus.SUCCESS);
	//
	// 	const createdChat: DirectChatShortDto = await this._directChatsService.createChat(
	// 		appUserPayload.id,
	// 		createDirectChatDto.receiverId,
	// 		createDirectChatDto.messageText,
	// 	);
	//
	// 	responseResult.data = { directChat: createdChat };
	//
	// 	const receiverClient: Socket | undefined = this._clients.get(createDirectChatDto.receiverId);
	//
	// 	if (receiverClient) {
	// 		receiverClient.emit(WSEvents.ON_CREATE_CHAT, responseResult);
	// 	}
	//
	// 	return {
	// 		event: WSEvents.ON_CREATE_CHAT,
	// 		data: responseResult,
	// 	};
	// }
	//
	// // TODO check if needed
	// @SubscribeMessage(WSEvents.SEND_MESSAGE)
	// public async sendMessage(
	// 	@AppUserPayload() appUserPayload: JWTPayloadDto,
	// 	@MessageBody() sendDirectMessageDto: SendDirectMessageDto,
	// ): Promise<WsResponse<WSResponseResult>> {
	// 	const responseResult: SuccessfulWSResponseResult<DirectChatMessageWithChatDto> =
	// 		new SuccessfulWSResponseResult<DirectChatMessageWithChatDto>(ResponseStatus.SUCCESS);
	//
	// 	const createdMessage: DirectChatMessageWithChatDto = await this._directChatsService.sendMessage(
	// 		appUserPayload.id,
	// 		sendDirectMessageDto.directChatId,
	// 		sendDirectMessageDto.messageText,
	// 	);
	//
	// 	responseResult.data = createdMessage;
	//
	// 	const messageReceiver: UserPublicDto =
	// 		createdMessage.directChat.users[0].id === appUserPayload.id
	// 			? createdMessage.directChat.users[1]
	// 			: createdMessage.directChat.users[0];
	//
	// 	const receiverClient: Socket | undefined = this._clients.get(messageReceiver.id);
	//
	// 	if (receiverClient) {
	// 		receiverClient.emit(WSEvents.ON_RECEIVE_MESSAGE, responseResult);
	// 	}
	//
	// 	return {
	// 		event: WSEvents.SEND_MESSAGE,
	// 		data: responseResult,
	// 	};
	// }
}
