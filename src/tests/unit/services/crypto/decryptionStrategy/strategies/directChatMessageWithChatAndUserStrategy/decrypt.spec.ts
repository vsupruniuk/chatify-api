import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';

import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies';
import { ICryptoService } from '@services';

import { providers } from '@modules/providers';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

import { directChats, directChatsMessages, users } from '@testMocks';

import { CustomProvider } from '@enums';

describe('Direct chat message with chat and user strategy', (): void => {
	let directChatMessageWithChatAndUserStrategy: DirectChatMessageWithChatAndUserStrategy;
	let cryptoService: ICryptoService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [DirectChatMessageWithChatAndUserStrategy, providers.CTF_CRYPTO_SERVICE],
		}).compile();

		directChatMessageWithChatAndUserStrategy = moduleFixture.get(
			DirectChatMessageWithChatAndUserStrategy,
		);
		cryptoService = moduleFixture.get(CustomProvider.CTF_CRYPTO_SERVICE);
	});

	describe('Decrypt', (): void => {
		const data: DirectChatMessageWithChatAndUserDto = plainToInstance(
			DirectChatMessageWithChatAndUserDto,
			{ ...directChatsMessages[3], directChat: { ...directChats[3] }, sender: { ...users[3] } },
			{ excludeExtraneousValues: true },
		);

		const decryptedTextMock: string = 'decryptedTextMock';

		beforeEach((): void => {
			jest.spyOn(cryptoService, 'decryptText').mockResolvedValue(decryptedTextMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call decrypt text method from crypto service to decrypt message text', async (): Promise<void> => {
			await directChatMessageWithChatAndUserStrategy.decrypt(data);

			expect(cryptoService.decryptText).toHaveBeenCalledTimes(1);
			expect(cryptoService.decryptText).toHaveBeenNthCalledWith(1, data.messageText);
		});

		it('should return message with decrypted text', async (): Promise<void> => {
			const directChatMessageWithChatAndUserDto: DirectChatMessageWithChatAndUserDto =
				await directChatMessageWithChatAndUserStrategy.decrypt(data);

			expect(directChatMessageWithChatAndUserDto.messageText).toBe(decryptedTextMock);
		});

		it('should return data as instance of the same type as input data', async (): Promise<void> => {
			const directChatMessageWithChatAndUserDto: DirectChatMessageWithChatAndUserDto =
				await directChatMessageWithChatAndUserStrategy.decrypt(data);

			expect(directChatMessageWithChatAndUserDto).toBeInstanceOf(data.constructor);
		});
	});
});
