import { Inject, Injectable } from '@nestjs/common';

import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies';
import { ICryptoService } from '@services';

import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { DirectChatMessageWithUserDto } from '@dtos/directChatMessages';

import { CustomProvider } from '@enums';

import { TransformHelper } from '@helpers';

@Injectable()
export class DirectChatWithUsersAndMessagesStrategy
	implements IDecryptionStrategy<DirectChatWithUsersAndMessagesDto>
{
	constructor(
		@Inject(CustomProvider.CTF_CRYPTO_SERVICE)
		private readonly _cryptoService: ICryptoService,
	) {}

	public async decrypt(
		data: DirectChatWithUsersAndMessagesDto,
	): Promise<DirectChatWithUsersAndMessagesDto> {
		return TransformHelper.toTargetDto(DirectChatWithUsersAndMessagesDto, {
			...data,
			messages: await Promise.all(
				data.messages.map(async (message: DirectChatMessageWithUserDto) => {
					return {
						...message,
						messageText: await this._cryptoService.decryptText(message.messageText),
					};
				}),
			),
		});
	}
}
