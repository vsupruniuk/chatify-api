import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { CreateDirectChatResponseDto } from '@dtos/directChats/CreateDirectChatResponse.dto';
import { Inject, Injectable } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { DirectChatMessageDto } from '@dtos/directChatMessages/DirectChatMessage.dto';

@Injectable()
export class CreateDirectChatResponseDtoDecryptionStrategy
	implements IDecryptionStrategy<CreateDirectChatResponseDto>
{
	constructor(
		@Inject(CustomProviders.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async decrypt(data: CreateDirectChatResponseDto): Promise<CreateDirectChatResponseDto> {
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
