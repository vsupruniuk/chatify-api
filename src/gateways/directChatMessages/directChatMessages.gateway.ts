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

import { WsExceptionFilter } from '@filters';

import { IDirectChatMessagesGateway } from '@gateways';

import { CustomProvider, WSEvent } from '@enums';

import { IDirectChatMessagesService, IJwtTokensService, IWSClientsService } from '@services';

import { wsAuthMiddleware } from '@middlewares';

import { AuthTypes } from '@customTypes';

import { AppUserPayload } from '@decorators/data';

import { MessageEncryptionPipe } from '@pipes';

import {
	DirectChatMessageWithChatAndUserDto,
	CreateDirectChatMessageRequestDto,
} from '@dtos/directChatMessages';
import { UserDto } from '@dtos/users';
import { JwtPayloadDto } from '@dtos/jwt';

@UsePipes(
	new ValidationPipe({
		whitelist: true,
		stopAtFirstError: false,
	}),
)
@UseFilters(WsExceptionFilter)
@WebSocketGateway()
export class DirectChatMessagesGateway
	implements IDirectChatMessagesGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		@Inject(CustomProvider.CTF_DIRECT_CHAT_MESSAGES_SERVICE)
		private readonly _directChatMessagesService: IDirectChatMessagesService,

		@Inject(CustomProvider.CTF_JWT_TOKENS_SERVICE)
		private readonly _jwtTokenService: IJwtTokensService,

		@Inject(CustomProvider.CTF_WS_CLIENTS_SERVICE)
		private readonly _wsClientsService: IWSClientsService,
	) {}

	public afterInit(@ConnectedSocket() client: Socket): void {
		client.use(wsAuthMiddleware(this._jwtTokenService));

		console.log(`${DirectChatMessagesGateway.name} is ready to listening events`);
	}

	public handleConnection(@ConnectedSocket() client: AuthTypes.TAuthorizedSocket): void {
		this._wsClientsService.set(client.user.id, client);
	}

	public handleDisconnect(@ConnectedSocket() client: AuthTypes.TAuthorizedSocket): void {
		this._wsClientsService.delete(client.user.id);
	}

	@SubscribeMessage(WSEvent.CREATE_MESSAGE)
	public async createMessage(
		@AppUserPayload() appUserPayload: JwtPayloadDto,
		@MessageBody(MessageEncryptionPipe)
		createDirectChatMessageRequestDto: CreateDirectChatMessageRequestDto,
	): Promise<void> {
		const createdMessage: DirectChatMessageWithChatAndUserDto =
			await this._directChatMessagesService.createMessage(
				appUserPayload.id,
				createDirectChatMessageRequestDto.directChatId,
				createDirectChatMessageRequestDto.messageText,
			);

		this._wsClientsService.notifyAllClients(
			createdMessage.directChat.users.map((user: UserDto) => user.id),
			WSEvent.ON_RECEIVE_MESSAGE,
			createdMessage,
		);
	}
}
