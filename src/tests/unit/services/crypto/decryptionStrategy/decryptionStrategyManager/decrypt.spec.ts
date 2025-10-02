import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';

import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';
import { DecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { providers } from '@modules/providers';

import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

import { directChats, users, directChatsMessages } from '@testMocks';

describe('Decryption strategy manager', (): void => {
	let decryptionStrategyManager: DecryptionStrategyManager;
	let directChatWithUsersAndMessagesStrategy: DirectChatWithUsersAndMessagesStrategy;
	let directChatMessageWithChatAndUserStrategy: DirectChatMessageWithChatAndUserStrategy;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DecryptionStrategyManager,

				DirectChatWithUsersAndMessagesStrategy,
				DirectChatMessageWithChatAndUserStrategy,

				providers.CTF_CRYPTO_SERVICE,
			],
		}).compile();

		decryptionStrategyManager = moduleFixture.get(DecryptionStrategyManager);
		directChatWithUsersAndMessagesStrategy = moduleFixture.get(
			DirectChatWithUsersAndMessagesStrategy,
		);
		directChatMessageWithChatAndUserStrategy = moduleFixture.get(
			DirectChatMessageWithChatAndUserStrategy,
		);
	});

	describe('Decrypt', (): void => {
		const directChatMock: DirectChatWithUsersAndMessagesDto = plainToInstance(
			DirectChatWithUsersAndMessagesDto,
			{
				...directChats[2],
				users: [{ ...users[3] }, { ...users[4] }],
				messages: [{ ...directChatsMessages[0] }],
			},
		);

		beforeEach((): void => {
			jest
				.spyOn(directChatWithUsersAndMessagesStrategy, 'decrypt')
				.mockResolvedValue(directChatMock);

			jest.spyOn(directChatMessageWithChatAndUserStrategy, 'decrypt').mockImplementation(jest.fn());
		});

		afterEach((): void => {
			jest.restoreAllMocks();

			Object.defineProperty(directChatMock.constructor, 'name', {
				value: DirectChatWithUsersAndMessagesDto.name,
			});
		});

		it('should throw internal server error if strategy for provided entity not implemented', async (): Promise<void> => {
			const originalClassName: string = directChatMock.constructor.name;

			Object.defineProperty(directChatMock.constructor, 'name', {
				value: 'NotExistingName',
			});

			await expect(decryptionStrategyManager.decrypt(directChatMock)).rejects.toThrow(
				InternalServerErrorException,
			);

			Object.defineProperty(directChatMock.constructor, 'name', {
				value: originalClassName,
			});
		});

		it('should call a decrypt method from a relevant decryption strategy', async (): Promise<void> => {
			await decryptionStrategyManager.decrypt(directChatMock);

			expect(directChatWithUsersAndMessagesStrategy.decrypt).toHaveBeenCalledTimes(1);
			expect(directChatWithUsersAndMessagesStrategy.decrypt).toHaveBeenNthCalledWith(
				1,
				directChatMock,
			);

			expect(directChatMessageWithChatAndUserStrategy.decrypt).not.toHaveBeenCalled();
		});

		it('should not change data constructor instance', async (): Promise<void> => {
			const decryptedData: DirectChatWithUsersAndMessagesDto =
				await decryptionStrategyManager.decrypt(directChatMock);

			expect(decryptedData).toBeInstanceOf(directChatMock.constructor);
		});
	});
});
