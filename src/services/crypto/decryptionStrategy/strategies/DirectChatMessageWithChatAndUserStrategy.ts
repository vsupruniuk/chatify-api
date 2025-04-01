import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { Inject } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';

export class DirectChatMessageWithChatAndUserStrategy
	implements IDecryptionStrategy<DirectChatMessageWithChatAndUserDto>
{
	constructor(
		@Inject(CustomProviders.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async decrypt(
		data: DirectChatMessageWithChatAndUserDto,
	): Promise<DirectChatMessageWithChatAndUserDto> {
		return {
			...data,
			messageText: await this._cryptoService.decryptText(data.messageText),
		};
	}
}
