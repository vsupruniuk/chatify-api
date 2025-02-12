import { Injectable } from '@nestjs/common';
import { IDirectChatsService } from '@interfaces/directChats/IDirectChatsService';

@Injectable()
export class DirectChatsService implements IDirectChatsService {
	constructor() // private readonly _directChatsRepository: IDirectChatsRepository, // @Inject(CustomProviders.CTF_DIRECT_CHATS_REPOSITORY)
	//
	// @Inject(CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY)
	// private readonly _directChatMessagesRepository: IDirectChatMessagesRepository,
	//
	// @Inject(CustomProviders.CTF_CRYPTO_SERVICE)
	// private readonly _cryptoService: ICryptoService,
	{}

	// // TODO check if needed
	// public async createChat(
	// 	senderId: string,
	// 	receiverId: string,
	// 	messageText: string,
	// ): Promise<DirectChatShortDto> {
	// 	const existingChat: DirectChat | null = await this._directChatsRepository.getChatByUsers(
	// 		senderId,
	// 		receiverId,
	// 	);
	//
	// 	if (existingChat) {
	// 		throw new UnprocessableEntityException('Direct chat between these users already exists');
	// 	}
	//
	// 	const createdChatId: string = await this._directChatsRepository.createChat(
	// 		senderId,
	// 		receiverId,
	// 		await this._cryptoService.encryptText(messageText),
	// 		DateHelper.dateTimeNow(),
	// 	);
	//
	// 	const createdChat: DirectChat | null =
	// 		await this._directChatsRepository.getChatById(createdChatId);
	//
	// 	if (!createdChat) {
	// 		throw new UnprocessableEntityException('Failed to create chat. Please, try again');
	// 	}
	//
	// 	const decryptedChat: DirectChat = {
	// 		...createdChat,
	// 		messages: await Promise.all(
	// 			createdChat.messages.map(async (message: DirectChatMessage) => {
	// 				return {
	// 					...message,
	// 					messageText: await this._cryptoService.decryptText(message.messageText),
	// 				};
	// 			}),
	// 		),
	// 	};
	//
	// 	return plainToInstance(DirectChatShortDto, decryptedChat, { excludeExtraneousValues: true });
	// }
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
