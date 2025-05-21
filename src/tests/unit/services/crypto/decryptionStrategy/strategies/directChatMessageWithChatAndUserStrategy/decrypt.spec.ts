import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import { Test, TestingModule } from '@nestjs/testing';
import providers from '@modules/providers/providers';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages/DirectChatMessageWithChatAndUser.dto';
import { plainToInstance } from 'class-transformer';
import { directChats } from '@testMocks/DirectChat/directChats';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { users } from '@testMocks/User/users';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { TransformHelper } from '@helpers/transform.helper';

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
		cryptoService = moduleFixture.get(CustomProviders.CTF_CRYPTO_SERVICE);
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
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', (): void => {
			expect(directChatMessageWithChatAndUserStrategy.decrypt).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatMessageWithChatAndUserStrategy.decrypt).toBeInstanceOf(Function);
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

		it('should use to target dto method from transform helper to transform data to appropriate dto', async (): Promise<void> => {
			const directChatMessageWithChatAndUserDto: DirectChatMessageWithChatAndUserDto =
				await directChatMessageWithChatAndUserStrategy.decrypt(data);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(
				1,
				DirectChatMessageWithChatAndUserDto,
				directChatMessageWithChatAndUserDto,
			);
		});
	});
});
