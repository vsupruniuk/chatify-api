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

import { IDirectChatsGateway } from '@gateways';

import { WsExceptionFilter } from '@filters';

import { CustomProviders, WSEvents } from '@enums';

import { IDirectChatsService, IJWTTokensService, IWSClientsService } from '@services';

import { WsAuthMiddleware } from '@middlewares';

import { CreateDirectChatRequestDto, DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { JWTPayloadDto } from '@dtos/jwt';
import {
	SendDirectChatMessageRequestDto,
	DirectChatMessageWithChatAndUserDto,
} from '@dtos/directChatMessages';
import { UserDto } from '@dtos/users';

import { AppUserPayload } from '@decorators/data';

import { MessageEncryptionPipe } from '@pipes';

import { GlobalTypes } from '@customTypes';

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
		const createdChat: DirectChatWithUsersAndMessagesDto =
			await this._directChatsService.createChat(
				appUserPayload.id,
				createDirectChatRequestDto.receiverId,
				createDirectChatRequestDto.messageText,
			);

		this._wsClientsService.notifyAllClients(
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
		const createdMessage: DirectChatMessageWithChatAndUserDto =
			await this._directChatsService.sendMessage(
				appUserPayload.id,
				sendDirectChatMessageRequestDto.directChatId,
				sendDirectChatMessageRequestDto.messageText,
			);

		this._wsClientsService.notifyAllClients(
			createdMessage.directChat.users.map((user: UserDto) => user.id),
			WSEvents.ON_RECEIVE_MESSAGE,
			createdMessage,
		);
	}
}
