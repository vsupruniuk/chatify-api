import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { DirectChatMessageDto } from '@dtos/directChatMessages/DirectChatMessage.dto';

@Injectable()
export class DirectChatWithUsersAndMessagesDtoDecryptionStrategy
	implements IDecryptionStrategy<DirectChatWithUsersAndMessagesDto>
{
	constructor(
		@Inject(CustomProviders.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async decrypt(
		data: DirectChatWithUsersAndMessagesDto,
	): Promise<DirectChatWithUsersAndMessagesDto> {
		return {
			...data,
			messages: await Promise.all(
				data.messages.map(async (message: DirectChatMessageDto) => {
					return {
						...message,
						messageText: await this._cryptoService.decryptText(message.messageText),
					};
				}),
			),
		};
	}
}
