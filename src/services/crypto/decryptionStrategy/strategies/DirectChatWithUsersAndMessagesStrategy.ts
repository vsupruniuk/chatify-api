import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { DirectChatMessageWithUserDto } from '@dtos/directChatMessages/DirectChatMessageWithUser.dto';

@Injectable()
export class DirectChatWithUsersAndMessagesStrategy
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
				data.messages.map(async (message: DirectChatMessageWithUserDto) => {
					return {
						...message,
						messageText: await this._cryptoService.decryptText(message.messageText),
					};
				}),
			),
		};
	}
}
