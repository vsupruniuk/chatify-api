import { Inject, Injectable } from '@nestjs/common';

import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies';
import { ICryptoService } from '@services';

import { CustomProvider } from '@enums';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

import { TransformHelper } from '@helpers';

@Injectable()
export class DirectChatMessageWithChatAndUserStrategy implements IDecryptionStrategy<DirectChatMessageWithChatAndUserDto> {
	constructor(
		@Inject(CustomProvider.CTF_CRYPTO_SERVICE)
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
