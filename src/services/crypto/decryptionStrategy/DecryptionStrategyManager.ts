import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';
import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DirectChatWithUsersAndMessagesDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesDtoDecryptionStrategy';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { DirectChatMessageWithChatAndUserDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserDtoDecryptionStrategy';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';

@Injectable()
export class DecryptionStrategyManager implements IDecryptionStrategyManager {
	private readonly strategies: Record<string, IDecryptionStrategy<object>> = {};

	constructor(
		directChatWithUsersAndMessagesDtoDecryptionStrategy: DirectChatWithUsersAndMessagesDtoDecryptionStrategy,
		directChatMessageWithChatAndUserDtoDecryptionStrategy: DirectChatMessageWithChatAndUserDtoDecryptionStrategy,
	) {
		this.strategies[DirectChatWithUsersAndMessagesDto.name] =
			directChatWithUsersAndMessagesDtoDecryptionStrategy;

		this.strategies[DirectChatMessageWithChatAndUserDto.name] =
			directChatMessageWithChatAndUserDtoDecryptionStrategy;
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
