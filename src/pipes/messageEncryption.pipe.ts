import { Inject, PipeTransform } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { ICryptoService } from '@services';

interface IMessage {
	messageText: string;
}

export class MessageEncryptionPipe implements PipeTransform {
	constructor(
		@Inject(CustomProvider.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async transform<V extends IMessage>(value: V): Promise<V> {
		return {
			...value,
			messageText: await this._cryptoService.encryptText(value.messageText),
		};
	}
}
