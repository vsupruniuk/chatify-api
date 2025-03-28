import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { SendDirectChatMessageResponseDto } from '@dtos/directChatMessages/SendDirectChatMessageResponse.dto';
import { Inject } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';

export class SendDirectChatMessageResponseDtoDecryptionStrategy
	implements IDecryptionStrategy<SendDirectChatMessageResponseDto>
{
	constructor(
		@Inject(CustomProviders.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async decrypt(
		data: SendDirectChatMessageResponseDto,
	): Promise<SendDirectChatMessageResponseDto> {
		return {
			...data,
			messageText: await this._cryptoService.decryptText(data.messageText),
		};
	}
}
