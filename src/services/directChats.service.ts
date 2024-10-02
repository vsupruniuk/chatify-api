import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DateHelper } from '@Helpers/date.helper';
import { ICryptoService } from '@Interfaces/crypto/ICryptoService';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Inject, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';
import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';

@Injectable()
export class DirectChatsService implements IDirectChatsService {
	constructor(
		@Inject(CustomProviders.I_DIRECT_CHATS_REPOSITORY_PROVIDER)
		private readonly _directChatsRepository: IDirectChatsRepository,

		@Inject(CustomProviders.I_CRYPTO_SERVICE_PROVIDER)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async createChat(createDirectChatDto: CreateDirectChatDto): Promise<string> {
		return await this._directChatsRepository.createChat(
			createDirectChatDto.senderId,
			createDirectChatDto.receiverId,
			await this._cryptoService.encryptText(createDirectChatDto.messageText),
			DateHelper.dateTimeNow(),
		);
	}

	public async getLastChats(
		userId: string,
		page?: number,
		take?: number,
	): Promise<DirectChatShortDto[]> {
		const { skip: skipRecords, take: takeRecords } = this._getPagination(page, take);

		const chats: DirectChat[] = await this._directChatsRepository.getLastChats(
			userId,
			skipRecords,
			takeRecords,
		);

		const decryptedChats: DirectChat[] = await Promise.all(
			chats.map(async (directChat: DirectChat) => {
				const decryptedMessages: DirectChatMessage[] = await Promise.all(
					directChat.messages.map(async (directChatsMessage: DirectChatMessage) => {
						return {
							...directChatsMessage,
							messageText: await this._cryptoService.decryptText(directChatsMessage.messageText),
						};
					}),
				);

				return {
					...directChat,
					messages: decryptedMessages,
				};
			}),
		);

		return plainToInstance(DirectChatShortDto, decryptedChats, { excludeExtraneousValues: true });
	}

	public async getChatMessages(
		userId: string,
		directChatId: string,
		page?: number,
		take?: number,
	): Promise<DirectChatMessageWithChatDto[]> {
		const { skip: skipRecords, take: takeRecords } = this._getPagination(page, take);

		const messages: DirectChatMessage[] = await this._directChatsRepository.getChatMessages(
			userId,
			directChatId,
			skipRecords,
			takeRecords,
		);

		const decryptedMessages: DirectChatMessage[] = await Promise.all(
			messages.map(async (message: DirectChatMessage) => {
				return {
					...message,
					messageText: await this._cryptoService.decryptText(message.messageText),
				};
			}),
		);

		return plainToInstance(DirectChatMessageWithChatDto, decryptedMessages, {
			excludeExtraneousValues: true,
		});
	}

	public async sendMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
	): Promise<DirectChatMessageWithChatDto> {
		const createdMessageId: string = await this._directChatsRepository.createMessage(
			senderId,
			directChatId,
			await this._cryptoService.encryptText(messageText),
			DateHelper.dateTimeNow(),
		);

		const createdMessage: DirectChatMessage | null =
			await this._directChatsRepository.getMessageById(createdMessageId);

		if (!createdMessage) {
			throw new UnprocessableEntityException('Failed to create message. Please try again');
		}

		createdMessage.messageText = await this._cryptoService.decryptText(createdMessage.messageText);

		return plainToInstance(DirectChatMessageWithChatDto, createdMessage, {
			excludeExtraneousValues: true,
		});
	}

	private _getPagination(page?: number, take: number = 10): { skip: number; take: number } {
		return {
			skip: !page ? 0 : page * take - take,
			take,
		};
	}
}
