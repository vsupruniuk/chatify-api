import { Inject, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { IDirectChatsGateway } from '@gateways/directChats/IDirectChatsGateway';
import { wsExceptionFilter } from '@filters/wsException.filter';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsService } from '@services/directChats/IDirectChatsService';
import { IJWTTokensService } from '@services/jwt/IJWTTokensService';
import { WsAuthMiddleware } from '@middlewares/wsAuth.middleware';
import { WSEvents } from '@enums/WSEvents.enum';
import { CreateDirectChatRequestDto } from '@dtos/directChats/CreateDirectChatRequest.dto';
import { AppUserPayload } from '@decorators/data/AppUser.decorator';
import { JWTPayloadDto } from '@dtos/jwt/JWTPayload.dto';
import { MessageEncryptionPipe } from '@pipes/messageEncryption.pipe';
import { CreateDirectChatResponseDto } from '@dtos/directChats/CreateDirectChatResponse.dto';
import { IWSClientsService } from '@services/wsClients/IWSClientsService';
import { GlobalTypes } from '../../typesNew/global';
import { SendDirectChatMessageRequestDto } from '@dtos/directChatMessages/SendDirectChatMessageRequest.dto';
import { SendDirectChatMessageResponseDto } from '@dtos/directChatMessages/SendDirectChatMessageResponse.dto';
import { UserDto } from '@dtos/users/UserDto';

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
	constructor(
		@Inject(CustomProviders.CTF_DIRECT_CHATS_SERVICE)
		private readonly _directChatsService: IDirectChatsService,

		@Inject(CustomProviders.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokenService: IJWTTokensService,

		@Inject(CustomProviders.CTF_WS_CLIENTS_SERVICE)
		private readonly _wsClientsService: IWSClientsService,
	) {}

	public afterInit(@ConnectedSocket() client: Socket): void {
		client.use(WsAuthMiddleware(this._jwtTokenService));

		console.log(`${DirectChatsGateway.name} is ready to listening events`);
	}

	public handleConnection(@ConnectedSocket() client: GlobalTypes.TAuthorizedSocket): void {
		this._wsClientsService.set(client.user.id, client);
	}

	public handleDisconnect(@ConnectedSocket() client: GlobalTypes.TAuthorizedSocket): void {
		this._wsClientsService.delete(client.user.id);
	}

	@SubscribeMessage(WSEvents.CREATE_CHAT)
	public async createDirectChat(
		@AppUserPayload() appUserPayload: JWTPayloadDto,

		@MessageBody(MessageEncryptionPipe) createDirectChatRequestDto: CreateDirectChatRequestDto,
	): Promise<void> {
		const createdChat: CreateDirectChatResponseDto = await this._directChatsService.createChat(
			appUserPayload.id,
			createDirectChatRequestDto.receiverId,
			createDirectChatRequestDto.messageText,
		);

		await this._wsClientsService.notifyAllClients(
			[appUserPayload.id, createDirectChatRequestDto.receiverId],
			WSEvents.ON_CREATE_CHAT,
			createdChat,
		);
	}

	@SubscribeMessage(WSEvents.SEND_MESSAGE)
	public async sendMessage(
		@AppUserPayload() appUserPayload: JWTPayloadDto,
		@MessageBody(MessageEncryptionPipe)
		sendDirectChatMessageRequestDto: SendDirectChatMessageRequestDto,
	): Promise<void> {
		const createdMessage: SendDirectChatMessageResponseDto =
			await this._directChatsService.sendMessage(
				appUserPayload.id,
				sendDirectChatMessageRequestDto.directChatId,
				sendDirectChatMessageRequestDto.messageText,
			);

		await this._wsClientsService.notifyAllClients(
			createdMessage.directChat.users.map((user: UserDto) => user.id),
			WSEvents.ON_RECEIVE_MESSAGE,
			createdMessage,
		);
	}
}
