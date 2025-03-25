import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	UnprocessableEntityException,
} from '@nestjs/common';
import { IDirectChatsService } from '@services/directChats/IDirectChatsService';
import { DirectChat } from '@entities/DirectChat.entity';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsRepository } from '@repositories/directChats/IDirectChatsRepository';
import { IUsersService } from '@services/users/IUsersService';
import { UserDto } from '@dtos/users/UserDto';
import { DateHelper } from '@helpers/date.helper';
import { TransformHelper } from '@helpers/transform.helper';
import { CreateDirectChatResponseDto } from '@dtos/directChats/CreateDirectChatResponse.dto';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';

@Injectable()
export class DirectChatsService implements IDirectChatsService {
	constructor(
		@Inject(CustomProviders.CTF_DIRECT_CHATS_REPOSITORY)
		private readonly _directChatsRepository: IDirectChatsRepository,

		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER)
		private readonly _decryptionStrategyManager: IDecryptionStrategyManager,
	) {}

	public async createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
	): Promise<CreateDirectChatResponseDto> {
		const chatUsers: UserDto[] = await this._usersService.getAllByIds([senderId, receiverId]);

		const isBothUsersExist: boolean = [senderId, receiverId].every((id: string) =>
			chatUsers.some((user: UserDto) => user.id === id),
		);

		if (!isBothUsersExist) {
			throw new BadRequestException('One of the chat members does not exist');
		}

		const existingChat: DirectChat | null = await this._directChatsRepository.getChatByUsersIds(
			senderId,
			receiverId,
		);

		if (existingChat) {
			throw new ConflictException('Direct chat between these users already exists');
		}

		const sender: UserDto = chatUsers[0].id === senderId ? chatUsers[0] : chatUsers[1];
		const receiver: UserDto = chatUsers[0].id === receiverId ? chatUsers[0] : chatUsers[1];

		const createdChat: DirectChat | null = await this._directChatsRepository.createChat(
			sender,
			receiver,
			messageText,
			DateHelper.dateTimeNow(),
		);

		if (!createdChat) {
			throw new UnprocessableEntityException('Failed to create chat. Please, try again');
		}

		return await this._decryptionStrategyManager.decrypt(
			TransformHelper.toTargetDto(CreateDirectChatResponseDto, createdChat),
		);
	}

	//
	// // TODO check if needed
	// public async getLastChats(
	// 	userId: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<DirectChatShortDto[]> {
	// 	const { skip: skipRecords, take: takeRecords } = this._getPagination(page, take);
	//
	// 	const chats: DirectChat[] = await this._directChatsRepository.getLastChats(
	// 		userId,
	// 		skipRecords,
	// 		takeRecords,
	// 	);
	//
	// 	const decryptedChats: DirectChat[] = await Promise.all(
	// 		chats.map(async (directChat: DirectChat) => {
	// 			const decryptedMessages: DirectChatMessage[] = await Promise.all(
	// 				directChat.messages.map(async (directChatsMessage: DirectChatMessage) => {
	// 					return {
	// 						...directChatsMessage,
	// 						messageText: await this._cryptoService.decryptText(directChatsMessage.messageText),
	// 					};
	// 				}),
	// 			);
	//
	// 			return {
	// 				...directChat,
	// 				messages: decryptedMessages,
	// 			};
	// 		}),
	// 	);
	//
	// 	return plainToInstance(DirectChatShortDto, decryptedChats, { excludeExtraneousValues: true });
	// }
	//
	// // TODO check if needed
	// public async getChatMessages(
	// 	userId: string,
	// 	directChatId: string,
	// 	page?: number,
	// 	take?: number,
	// ): Promise<DirectChatMessageWithChatDto[]> {
	// 	const { skip: skipRecords, take: takeRecords } = this._getPagination(page, take);
	//
	// 	const messages: DirectChatMessage[] = await this._directChatMessagesRepository.getChatMessages(
	// 		userId,
	// 		directChatId,
	// 		skipRecords,
	// 		takeRecords,
	// 	);
	//
	// 	const decryptedMessages: DirectChatMessage[] = await Promise.all(
	// 		messages.map(async (message: DirectChatMessage) => {
	// 			return {
	// 				...message,
	// 				messageText: await this._cryptoService.decryptText(message.messageText),
	// 			};
	// 		}),
	// 	);
	//
	// 	return plainToInstance(DirectChatMessageWithChatDto, decryptedMessages, {
	// 		excludeExtraneousValues: true,
	// 	});
	// }
	//
	// // TODO check if needed
	// public async sendMessage(
	// 	senderId: string,
	// 	directChatId: string,
	// 	messageText: string,
	// ): Promise<DirectChatMessageWithChatDto> {
	// 	const createdMessageId: string = await this._directChatMessagesRepository.createMessage(
	// 		senderId,
	// 		directChatId,
	// 		await this._cryptoService.encryptText(messageText),
	// 		DateHelper.dateTimeNow(),
	// 	);
	//
	// 	const createdMessage: DirectChatMessage | null =
	// 		await this._directChatMessagesRepository.getMessageById(createdMessageId);
	//
	// 	if (!createdMessage) {
	// 		throw new UnprocessableEntityException('Failed to create message. Please try again');
	// 	}
	//
	// 	createdMessage.messageText = await this._cryptoService.decryptText(createdMessage.messageText);
	//
	// 	return plainToInstance(DirectChatMessageWithChatDto, createdMessage, {
	// 		excludeExtraneousValues: true,
	// 	});
	// }
	//
	// // TODO check if needed
	// private _getPagination(page?: number, take: number = 10): { skip: number; take: number } {
	// 	return {
	// 		skip: !page ? 0 : page * take - take,
	// 		take,
	// 	};
	// }
}
