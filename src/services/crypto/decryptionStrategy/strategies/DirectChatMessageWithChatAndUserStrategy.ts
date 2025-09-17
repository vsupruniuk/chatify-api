import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { Inject, Injectable } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';
import { TransformHelper } from '@helpers/transform.helper';

@Injectable()
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
		return TransformHelper.toTargetDto(DirectChatMessageWithChatAndUserDto, {
			...data,
			messageText: await this._cryptoService.decryptText(data.messageText),
		});
	}
}
