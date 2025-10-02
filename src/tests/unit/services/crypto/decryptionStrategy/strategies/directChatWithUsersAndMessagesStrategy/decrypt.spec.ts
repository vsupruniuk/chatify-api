import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';

import { providers } from '@modules/providers';

import { directChats, users, directChatsMessages } from '@testMocks';

import { CustomProviders } from '@enums';

import { ICryptoService } from '@services';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies';

import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { DirectChatMessageWithUserDto } from '@dtos/directChatMessages';

describe('Direct chat message with chat and user strategy', (): void => {
	let directChatWithUsersAndMessagesStrategy: DirectChatWithUsersAndMessagesStrategy;
	let cryptoService: ICryptoService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [DirectChatWithUsersAndMessagesStrategy, providers.CTF_CRYPTO_SERVICE],
		}).compile();

		directChatWithUsersAndMessagesStrategy = moduleFixture.get(
			DirectChatWithUsersAndMessagesStrategy,
		);
		cryptoService = moduleFixture.get(CustomProviders.CTF_CRYPTO_SERVICE);
	});

	describe('Decrypt', (): void => {
		const data: DirectChatWithUsersAndMessagesDto = plainToInstance(
			DirectChatWithUsersAndMessagesDto,
			{ ...directChats[2], users: users.slice(2, 4), messages: directChatsMessages.slice(2, 4) },
			{ excludeExtraneousValues: true },
		);

		const decryptedTextMock: string = 'decryptedTextMock';

		beforeEach((): void => {
			jest.spyOn(cryptoService, 'decryptText').mockResolvedValue(decryptedTextMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should call decrypt text method from crypto service to decrypt message text', async (): Promise<void> => {
			await directChatWithUsersAndMessagesStrategy.decrypt(data);

			expect(cryptoService.decryptText).toHaveBeenCalledTimes(data.messages.length);

			data.messages.forEach((message: DirectChatMessageWithUserDto, index: number) => {
				expect(cryptoService.decryptText).toHaveBeenNthCalledWith(index + 1, message.messageText);
			});
		});

		it('should return message with decrypted text', async (): Promise<void> => {
			const directChatWithUsersAndMessagesDto: DirectChatWithUsersAndMessagesDto =
				await directChatWithUsersAndMessagesStrategy.decrypt(data);

			directChatWithUsersAndMessagesDto.messages.forEach(
				(message: DirectChatMessageWithUserDto) => {
					expect(message.messageText).toBe(decryptedTextMock);
				},
			);
		});

		it('should return data as instance of the same type as input data', async (): Promise<void> => {
			const directChatWithUsersAndMessagesDto: DirectChatWithUsersAndMessagesDto =
				await directChatWithUsersAndMessagesStrategy.decrypt(data);

			expect(directChatWithUsersAndMessagesDto).toBeInstanceOf(data.constructor);
		});
	});
});
