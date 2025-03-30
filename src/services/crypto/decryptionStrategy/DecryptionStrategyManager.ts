import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';
import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DirectChatWithUsersAndMessagesDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesDtoDecryptionStrategy';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { SendDirectChatMessageResponseDto } from '@dtos/directChatMessages/SendDirectChatMessageResponse.dto';
import { SendDirectChatMessageResponseDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/SendDirectChatMessageResponseDtoDecryptionStrategy';

@Injectable()
export class DecryptionStrategyManager implements IDecryptionStrategyManager {
	private readonly strategies: Record<string, IDecryptionStrategy<object>> = {};

	constructor(
		directChatWithUsersAndMessagesDtoDecryptionStrategy: DirectChatWithUsersAndMessagesDtoDecryptionStrategy,
		sendDirectChatMessageResponseDtoDecryptionStrategy: SendDirectChatMessageResponseDtoDecryptionStrategy,
	) {
		this.strategies[DirectChatWithUsersAndMessagesDto.name] =
			directChatWithUsersAndMessagesDtoDecryptionStrategy;

		this.strategies[SendDirectChatMessageResponseDto.name] =
			sendDirectChatMessageResponseDtoDecryptionStrategy;
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
