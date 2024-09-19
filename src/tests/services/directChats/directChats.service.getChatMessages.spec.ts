import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { ICryptoService } from '@Interfaces/crypto/ICryptoService';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { connectionSource } from '@DB/typeOrmConfig';
import { CryptoService } from '@Services/crypto.service';
import { DirectChatsService } from '@Services/directChats.service';
import SpyInstance = jest.SpyInstance;
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { directChatsMessages } from '@TestMocks/DirectChatMessage/directChatsMessages';
import { directChats } from '@TestMocks/DirectChat/directChats';
import { DirectChatMessageWithChatDto } from '@DTO/directChatMessages/DirectChatMessageWithChat.dto';
import { users } from '@TestMocks/User/users';

describe('directChatsService', (): void => {
	let directChatsService: IDirectChatsService;
	let directChatsRepository: IDirectChatsRepository;
	let cryptoService: ICryptoService;

	beforeAll((): void => {
		directChatsRepository = new DirectChatsRepository(connectionSource);
		cryptoService = new CryptoService();

		directChatsService = new DirectChatsService(directChatsRepository, cryptoService);
	});

	describe('getChatMessages', (): void => {
		let getChatMessagesMock: SpyInstance;
		let decryptTextMock: SpyInstance;

		const directChatMessagesMock: DirectChatMessage[] = [...directChatsMessages];
		const directChatIdMock: string = directChats[0].id;
		const userIdMock: string = users[2].id;

		beforeEach((): void => {
			getChatMessagesMock = jest
				.spyOn(directChatsRepository, 'getChatMessages')
				.mockImplementation(async (): Promise<DirectChatMessage[]> => directChatMessagesMock);

			decryptTextMock = jest
				.spyOn(cryptoService, 'decryptText')
				.mockImplementation(async (): Promise<string> => 'Decrypted text.');
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatsService.getChatMessages).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.getChatMessages).toBeInstanceOf(Function);
		});

		it('should use getChatMessages method from direct chats repository to get chat messages', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			await directChatsService.getChatMessages(userIdMock, directChatIdMock, page, take);

			expect(getChatMessagesMock).toHaveBeenCalledTimes(1);
			expect(getChatMessagesMock).toHaveBeenCalledWith(
				userIdMock,
				directChatIdMock,
				page * take - take,
				take,
			);
		});

		it('should use decryptText method from crypto service for each message to decrypt messages', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			await directChatsService.getChatMessages(userIdMock, directChatIdMock, page, take);

			const chatMessages: DirectChatMessage[] = await directChatsRepository.getChatMessages(
				userIdMock,
				directChatIdMock,
				page * take - take,
				take,
			);

			expect(decryptTextMock).toHaveBeenCalledTimes(chatMessages.length);

			for (let i = 1; i <= chatMessages.length; i += 1) {
				expect(decryptTextMock).toHaveBeenNthCalledWith(i, chatMessages[i - 1].messageText);
			}
		});

		it('should provide default values for getChatMessages method if page or take not provided', async (): Promise<void> => {
			await directChatsService.getChatMessages(userIdMock, directChatIdMock);

			expect(getChatMessagesMock).toHaveBeenCalledTimes(1);
			expect(getChatMessagesMock).toHaveBeenCalledWith(userIdMock, directChatIdMock, 0, 10);
		});

		it('should return response as instance of Array', async (): Promise<void> => {
			const chatMessages: DirectChatMessageWithChatDto[] = await directChatsService.getChatMessages(
				userIdMock,
				directChatIdMock,
			);

			expect(chatMessages).toBeInstanceOf(Array);
		});

		it('should return each chat as instance of DirectChatMessageWithChatDto', async (): Promise<void> => {
			const chatMessages: DirectChatMessageWithChatDto[] = await directChatsService.getChatMessages(
				userIdMock,
				directChatIdMock,
			);

			chatMessages.forEach((message: DirectChatMessageWithChatDto) => {
				expect(message).toBeInstanceOf(DirectChatMessageWithChatDto);
			});
		});
	});
});
