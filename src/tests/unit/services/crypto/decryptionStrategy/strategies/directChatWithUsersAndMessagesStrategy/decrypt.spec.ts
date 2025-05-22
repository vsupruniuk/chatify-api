import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { plainToInstance } from 'class-transformer';
import { directChats } from '@testMocks/DirectChat/directChats';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { users } from '@testMocks/User/users';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { TransformHelper } from '@helpers/transform.helper';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import { DirectChatMessageWithUserDto } from '@dtos/directChatMessages/DirectChatMessageWithUser.dto';

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
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatWithUsersAndMessagesStrategy.decrypt).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatWithUsersAndMessagesStrategy.decrypt).toBeInstanceOf(Function);
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

		it('should use to target dto method from transform helper to transform data to appropriate dto', async (): Promise<void> => {
			const directChatWithUsersAndMessagesDto: DirectChatWithUsersAndMessagesDto =
				await directChatWithUsersAndMessagesStrategy.decrypt(data);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(
				1,
				DirectChatWithUsersAndMessagesDto,
				directChatWithUsersAndMessagesDto,
			);
		});
	});
});
