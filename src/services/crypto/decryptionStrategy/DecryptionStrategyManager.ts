import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';
import { IDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/IDecryptionStrategy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateDirectChatResponseDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/CreateDirectChatResponseDtoDecryptionStrategy';
import { CreateDirectChatResponseDto } from '@dtos/directChats/CreateDirectChatResponse.dto';
import { SendDirectChatMessageResponseDto } from '@dtos/directChatMessages/SendDirectChatMessageResponse.dto';
import { SendDirectChatMessageResponseDtoDecryptionStrategy } from '@services/crypto/decryptionStrategy/strategies/SendDirectChatMessageResponseDtoDecryptionStrategy';

@Injectable()
export class DecryptionStrategyManager implements IDecryptionStrategyManager {
	private readonly strategies: Record<string, IDecryptionStrategy<object>> = {};

	constructor(
		createDirectChatResponseDtoDecryptionStrategy: CreateDirectChatResponseDtoDecryptionStrategy,
		sendDirectChatMessageResponseDtoDecryptionStrategy: SendDirectChatMessageResponseDtoDecryptionStrategy,
	) {
		this.strategies[CreateDirectChatResponseDto.name] =
			createDirectChatResponseDtoDecryptionStrategy;

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
