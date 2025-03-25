import { Inject, PipeTransform } from '@nestjs/common';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';

interface IMessage {
	messageText: string;
}

export class MessageEncryptionPipe implements PipeTransform {
	constructor(
		@Inject(CustomProviders.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async transform<T extends IMessage>(value: T): Promise<T> {
		return {
			...value,
			messageText: await this._cryptoService.encryptText(value.messageText),
		};
	}
}
