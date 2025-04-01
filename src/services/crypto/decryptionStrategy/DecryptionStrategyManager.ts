import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';
import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';

@Injectable()
export class DecryptionStrategyManager implements IDecryptionStrategyManager {
	private readonly strategies: Record<string, IDecryptionStrategy<object>> = {};

	constructor(
		directChatWithUsersAndMessagesStrategy: DirectChatWithUsersAndMessagesStrategy,
		directChatMessageWithChatAndUserStrategy: DirectChatMessageWithChatAndUserStrategy,
	) {
		this.strategies[DirectChatWithUsersAndMessagesDto.name] =
			directChatWithUsersAndMessagesStrategy;

		this.strategies[DirectChatMessageWithChatAndUserDto.name] =
			directChatMessageWithChatAndUserStrategy;
	}

	public async decrypt<T extends object>(data: T): Promise<T> {
		const className: string = data.constructor.name;
		const strategy: IDecryptionStrategy<object> | null = this.strategies[className] || null;

		if (!strategy) {
			throw new InternalServerErrorException(
				`Decryption strategy is not implemented for DTO: ${className}`,
			);
		}

		return (await strategy.decrypt(data)) as T;
	}
}
