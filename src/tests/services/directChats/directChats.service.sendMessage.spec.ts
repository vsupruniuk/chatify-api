import { connectionSource } from '@db/typeOrmConfig';
import { DirectChatMessagesRepository } from '@repositories/directChatMessages.repository';
import { DirectChatsRepository } from '@repositories/directChats.repository';
import { CryptoService } from '@services/crypto.service';
import { DirectChatsService } from '@services/directChats.service';
import SpyInstance = jest.SpyInstance;
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { directChatsMessages } from '@testMocks/DirectChatMessage/directChatsMessages';
import { DateHelper } from '@helpers/date.helper';
import { UnprocessableEntityException } from '@nestjs/common';
import { DirectChatMessageWithChatDto } from '../../../types/dto/directChatMessages/DirectChatMessageWithChat.dto';

describe.skip('Direct chats service', (): void => {
	let directChatsService: DirectChatsService;
	let directChatsRepository: DirectChatsRepository;
	let directChatMessagesRepository: DirectChatMessagesRepository;
	let cryptoService: CryptoService;

	beforeAll((): void => {
		directChatsRepository = new DirectChatsRepository(connectionSource);
		directChatMessagesRepository = new DirectChatMessagesRepository(connectionSource);
		cryptoService = new CryptoService();

		directChatsService = new DirectChatsService(
			directChatsRepository,
			directChatMessagesRepository,
			cryptoService,
		);
	});

	describe('sendMessage', (): void => {
		let createMessageMock: SpyInstance;
		let getMessageByIdMock: SpyInstance;
		let encryptTextMock: SpyInstance;
		let decryptTextMock: SpyInstance;
		let dateTimeNowMock: SpyInstance;

		const directChatMessagesMock: DirectChatMessage[] = [...directChatsMessages];

		const createdMessageId: string = directChatMessagesMock[0].id;
		const nonExistingMessageId: string = '38a859f8-e20b-4ec1-ac7e-ae07c7db9f5b';
		const directChatId: string = directChatMessagesMock[0].directChat.id;
		const senderId: string = directChatMessagesMock[0].sender.id;
		const messageText: string = directChatMessagesMock[0].messageText;
		const dateTimeMock: string = '2024-09-27 18:50:00';
		const encryptedTextMock: string = 'encryptedTextMock';

		let returnFakeMessageId: boolean = false;

		beforeEach((): void => {
			jest.useFakeTimers();

			createMessageMock = jest
				.spyOn(directChatMessagesRepository, 'createMessage')
				.mockImplementation(
					async (): Promise<string> =>
						returnFakeMessageId ? nonExistingMessageId : createdMessageId,
				);

			getMessageByIdMock = jest
				.spyOn(directChatMessagesRepository, 'getMessageById')
				.mockImplementation(async (messageId: string): Promise<DirectChatMessage | null> => {
					return (
						directChatMessagesMock.find((message: DirectChatMessage) => message.id === messageId) ||
						null
					);
				});

			encryptTextMock = jest
				.spyOn(cryptoService, 'encryptText')
				.mockImplementation(async (): Promise<string> => encryptedTextMock);

			decryptTextMock = jest
				.spyOn(cryptoService, 'decryptText')
				.mockImplementation(async (): Promise<string> => 'decryptedText');

			dateTimeNowMock = jest
				.spyOn(DateHelper, 'dateTimeNow')
				.mockReturnValue(new Date(dateTimeMock).toISOString());
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();

			returnFakeMessageId = false;
		});

		it('should be defined', async (): Promise<void> => {
			expect(directChatsService.sendMessage).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.sendMessage).toBeInstanceOf(Function);
		});

		it('should call encryptText method in crypto service to encrypt message text', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.sendMessage(senderId, directChatId, messageText);

			expect(encryptTextMock).toHaveBeenCalledTimes(1);
			expect(encryptTextMock).toHaveBeenNthCalledWith(1, messageText);
		});

		it('should call dateTimeNow method in Date helper to get current date and time', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.sendMessage(senderId, directChatId, messageText);

			expect(dateTimeNowMock).toHaveBeenCalledTimes(1);
		});

		it('should call createMessage method in directChats repository to create message', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.sendMessage(senderId, directChatId, messageText);

			expect(createMessageMock).toHaveBeenCalledTimes(1);
			expect(createMessageMock).toHaveBeenCalledWith(
				senderId,
				directChatId,
				encryptedTextMock,
				DateHelper.dateTimeNow(),
			);
		});

		it('should call getMessageById method in direct chats repository to get created message', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.sendMessage(senderId, directChatId, messageText);

			expect(getMessageByIdMock).toHaveBeenCalledTimes(1);
			expect(getMessageByIdMock).toHaveBeenNthCalledWith(1, createdMessageId);
		});

		it('should call decryptText method in crypto service to decrypt message text', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.sendMessage(senderId, directChatId, messageText);

			const message: DirectChatMessage | null =
				await directChatMessagesRepository.getMessageById(createdMessageId);

			expect(decryptTextMock).toHaveBeenCalledTimes(1);
			expect(decryptTextMock).toHaveBeenNthCalledWith(1, message!.messageText);
		});

		it('should throw UnprocessableEntityException if repository method failed to create message', async (): Promise<void> => {
			returnFakeMessageId = true;

			await expect(
				directChatsService.sendMessage(senderId, directChatId, messageText),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should return created message as instance of DirectChatMessageWithChatDto', async (): Promise<void> => {
			const createdMessage: DirectChatMessageWithChatDto = await directChatsService.sendMessage(
				senderId,
				directChatId,
				messageText,
			);

			expect(createdMessage.id).toBe(createdMessageId);
			expect(createdMessage).toBeInstanceOf(DirectChatMessageWithChatDto);
		});
	});
});
