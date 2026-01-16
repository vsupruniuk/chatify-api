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

import { CustomProvider, WSEvent } from '@enums';

import { IDirectChatsService, IJwtTokensService, IWSClientsService } from '@services';

import { wsAuthMiddleware } from '@middlewares';

import { CreateDirectChatRequestDto, DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { JwtPayloadDto } from '@dtos/jwt';

import { AppUserPayload } from '@decorators/data';

import { MessageEncryptionPipe } from '@pipes';

import { AuthTypes } from '@customTypes';

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
		@Inject(CustomProvider.CTF_DIRECT_CHATS_SERVICE)
		private readonly _directChatsService: IDirectChatsService,

		@Inject(CustomProvider.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokenService: IJwtTokensService,

		@Inject(CustomProvider.CTF_WS_CLIENTS_SERVICE)
		private readonly _wsClientsService: IWSClientsService,
	) {}

	public afterInit(@ConnectedSocket() client: Socket): void {
		client.use(wsAuthMiddleware(this._jwtTokenService));

		console.log(`${DirectChatsGateway.name} is ready to listening events`);
	}

	public handleConnection(@ConnectedSocket() client: AuthTypes.TAuthorizedSocket): void {
		this._wsClientsService.set(client.user.id, client);
	}

	public handleDisconnect(@ConnectedSocket() client: AuthTypes.TAuthorizedSocket): void {
		this._wsClientsService.delete(client.user.id);
	}

	@SubscribeMessage(WSEvent.CREATE_CHAT)
	public async createDirectChat(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
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
			WSEvent.ON_CREATE_CHAT,
			createdChat,
		);
	}
}
