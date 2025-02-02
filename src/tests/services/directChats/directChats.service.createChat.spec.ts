import { connectionSource } from '@DB/typeOrmConfig';
import { DateHelper } from '@Helpers/date.helper';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { CryptoService } from '@Services/crypto.service';
import { DirectChatsService } from '@Services/directChats.service';
import SpyInstance = jest.SpyInstance;
import { DirectChat } from '@Entities/DirectChat.entity';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';
import { UnprocessableEntityException } from '@nestjs/common';
import { DirectChatMessagesRepository } from '@Repositories/directChatMessages.repository';

describe('Direct chats', (): void => {
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

	describe('createChat', (): void => {
		let createChatMock: SpyInstance;
		let getChatByUsersMock: SpyInstance;
		let getChatByIdMock: SpyInstance;
		let encryptTextMock: SpyInstance;
		let decryptTextMock: SpyInstance;
		let dateTimeNowMock: SpyInstance;

		let isChatCreated: boolean = true;

		const notExistingChatId: string = '63609e44-5a3d-41e6-96ad-7d0242260172';
		const createdChatId: string = directChats[2].id;
		const createdChat: DirectChat = directChats[2];
		const existingChat: DirectChat = directChats[0];
		const senderId: string = 'f42845d7-90af-4c29-8e1a-227c90b33852';
		const receiverId: string = '699901e8-653f-4ac2-841e-b85388c4b89c';
		const existingChatFirstUser: string = 'eeae9eae-32c2-4a19-981d-fd4b92860337';
		const existingChatSecondUser: string = '376dc6ad-3763-4008-9af5-1aeee27468d4';
		const messageText: string = 'Hello, world!';
		const dateTimeMock: string = '2024-06-10 23:25:00';

		beforeEach((): void => {
			jest.useFakeTimers();

			getChatByUsersMock = jest
				.spyOn(directChatsRepository, 'getChatByUsers')
				.mockImplementation(
					async (firstUserId: string, secondUserId: string): Promise<DirectChat | null> => {
						if (
							(firstUserId === existingChatFirstUser || firstUserId === existingChatSecondUser) &&
							(secondUserId === existingChatFirstUser || secondUserId === existingChatSecondUser)
						) {
							return existingChat;
						}

						return null;
					},
				);

			createChatMock = jest
				.spyOn(directChatsRepository, 'createChat')
				.mockImplementation(async () => {
					return isChatCreated ? createdChatId : notExistingChatId;
				});

			getChatByIdMock = jest
				.spyOn(directChatsRepository, 'getChatById')
				.mockImplementation(async (chatId: string) => {
					return chatId === createdChatId ? createdChat : null;
				});

			encryptTextMock = jest
				.spyOn(cryptoService, 'encryptText')
				.mockImplementation(async (text: string) => Buffer.from(text, 'utf-8').toString('base64'));

			decryptTextMock = jest
				.spyOn(cryptoService, 'decryptText')
				.mockImplementation(async () => 'decrypted text');

			dateTimeNowMock = jest
				.spyOn(DateHelper, 'dateTimeNow')
				.mockReturnValue(new Date(dateTimeMock).toISOString());
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();

			isChatCreated = true;
		});

		it('should be defined', async (): Promise<void> => {
			expect(directChatsService.createChat).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.createChat).toBeInstanceOf(Function);
		});

		it('should call getChatByUsers method to check if direct chat between these users exist', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(getChatByUsersMock).toHaveBeenCalledTimes(1);
			expect(getChatByUsersMock).toHaveBeenNthCalledWith(1, senderId, receiverId);
		});

		it('should call encryptText method in crypto service to encrypt message text', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(encryptTextMock).toHaveBeenCalledTimes(1);
			expect(encryptTextMock).toHaveBeenNthCalledWith(1, messageText);
		});

		it('should call dateTimeNow method in date helper to set current date and time to message', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(dateTimeNowMock).toHaveBeenCalledTimes(1);
		});

		it('should call createChat method in direct chat repository to create direct chat', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(createChatMock).toHaveBeenCalledTimes(1);
			expect(createChatMock).toHaveBeenCalledWith(
				senderId,
				receiverId,
				await cryptoService.encryptText(messageText),
				DateHelper.dateTimeNow(),
			);
		});

		it('should call getChatById method from direct chats repository to get created chat', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(getChatByIdMock).toHaveBeenCalledTimes(1);
			expect(getChatByIdMock).toHaveBeenNthCalledWith(1, createdChatId);
		});

		it('should throw UnprocessableEntityException if chat between users already exist', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await expect(
				directChatsService.createChat(existingChatFirstUser, existingChatSecondUser, messageText),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should throw UnprocessableEntityException if repository cannot get created chat', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));
			isChatCreated = false;

			await expect(
				directChatsService.createChat(senderId, receiverId, messageText),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should call decryptText method in crypto service to decrypt message text', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(decryptTextMock).toHaveBeenCalledTimes(1);
			expect(decryptTextMock).toHaveBeenNthCalledWith(1, createdChat.messages[0].messageText);
		});

		it('should return created chat', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			const chat: DirectChatShortDto = await directChatsService.createChat(
				senderId,
				receiverId,
				messageText,
			);

			expect(chat.id).toBe(createdChat.id);
		});

		it('should return created chat as instance of DirectChatShortDto', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			const chat: DirectChatShortDto = await directChatsService.createChat(
				senderId,
				receiverId,
				messageText,
			);

			expect(chat).toBeInstanceOf(DirectChatShortDto);
		});
	});
});
