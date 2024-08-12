import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { DateHelper } from '@Helpers/date.helper';
import { ICryptoService } from '@Interfaces/crypto/ICryptoService';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { Inject, Injectable } from '@nestjs/common';

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

	public async getChats(): Promise<string> {
		const chats = await this._directChatsRepository.getChats(0, 10, '2');

		console.log(chats);

		return '';
	}
}
