import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DateHelper } from '@Helpers/date.helper';
import { ICryptoService } from '@Interfaces/crypto/ICryptoService';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatsList.dto';
import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';

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
		const { skip: skipRecords, take: takeRecords } = this._getDirectChatsPagination(page, take);

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

	public async getChatMessages(): Promise<void> {
		console.log(
			await this._directChatsRepository.getChatMessages(
				'a1e94a3e-911e-4d8e-bf4f-8da509f77d6c',
				0,
				10,
			),
		);
	}

	private _getDirectChatsPagination(
		page?: number,
		take: number = 10,
	): { skip: number; take: number } {
		return {
			skip: !page ? 0 : page * take - take,
			take,
		};
	}
}
