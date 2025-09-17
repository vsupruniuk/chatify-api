import { Test, TestingModule } from '@nestjs/testing';
import { MessageEncryptionPipe } from '@pipes/messageEncryption.pipe';
import providers from '@modules/providers/providers';
import { ICryptoService } from '@services/crypto/ICryptoService';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';

describe('Message encryption pipe', (): void => {
	let messageEncryptionPipe: MessageEncryptionPipe;
	let cryptoService: ICryptoService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [MessageEncryptionPipe, providers.CTF_CRYPTO_SERVICE],
		}).compile();

		messageEncryptionPipe = moduleFixture.get(MessageEncryptionPipe);
		cryptoService = moduleFixture.get(CustomProviders.CTF_CRYPTO_SERVICE);
	});

	describe('Transform', (): void => {
		const directChatMessageMock: DirectChatMessage = directChatsMessages[1];
		const encryptedMessageMock: string = 'encryptedMessageMock';

		beforeEach((): void => {
			jest.spyOn(cryptoService, 'encryptText').mockResolvedValue(encryptedMessageMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call encrypt text method from crypto service', async (): Promise<void> => {
			await messageEncryptionPipe.transform(directChatMessageMock);

			expect(cryptoService.encryptText).toHaveBeenCalledTimes(1);
			expect(cryptoService.encryptText).toHaveBeenNthCalledWith(
				1,
				directChatMessageMock.messageText,
			);
		});

		it('should return the same message object with encrypted message text', async (): Promise<void> => {
			const encryptedMessage: DirectChatMessage =
				await messageEncryptionPipe.transform(directChatMessageMock);

			expect(encryptedMessage).toEqual({
				...directChatMessageMock,
				messageText: encryptedMessageMock,
			});
		});
	});
});
