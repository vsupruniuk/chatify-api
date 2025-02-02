import { IDirectChatsService } from '@Interfaces/directChats/IDirectChatsService';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { ICryptoService } from '@Interfaces/crypto/ICryptoService';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { connectionSource } from '@DB/typeOrmConfig';
import { CryptoService } from '@Services/crypto.service';
import { DirectChatsService } from '@Services/directChats.service';
import { DirectChat } from '@Entities/DirectChat.entity';
import { directChats } from '@TestMocks/DirectChat/directChats';
import SpyInstance = jest.SpyInstance;
import { users } from '@TestMocks/User/users';
import { DirectChatShortDto } from '@DTO/directChat/DirectChatShort.dto';
import { IDirectChatMessagesRepository } from '@Interfaces/directChatMessages/IDirectChatMessagesRepository';
import { DirectChatMessagesRepository } from '@Repositories/directChatMessages.repository';

describe('directChatsService', (): void => {
	let directChatsService: IDirectChatsService;
	let directChatsRepository: IDirectChatsRepository;
	let directChatMessagesRepository: IDirectChatMessagesRepository;
	let cryptoService: ICryptoService;

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

	describe('getLastChats', () => {
		let getLastChatsMock: SpyInstance;
		let decryptTextMock: SpyInstance;

		const directChatsMock: DirectChat[] = [...directChats];
		const userIdMock: string = users[2].id;

		beforeEach((): void => {
			getLastChatsMock = jest
				.spyOn(directChatsRepository, 'getLastChats')
				.mockImplementation(async (): Promise<DirectChat[]> => directChatsMock);

			decryptTextMock = jest
				.spyOn(cryptoService, 'decryptText')
				.mockImplementation(async (): Promise<string> => 'Decrypted text.');
		});

		afterEach((): void => {
			jest.clearAllMocks();
		});

		it('should be declared', (): void => {
			expect(directChatsService.getLastChats).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.getLastChats).toBeInstanceOf(Function);
		});

		it('should use getLastChats method from direct chats repository to get user last chats', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			await directChatsService.getLastChats(userIdMock, page, take);

			expect(getLastChatsMock).toHaveBeenCalledTimes(1);
			expect(getLastChatsMock).toHaveBeenCalledWith(userIdMock, page * take - take, take);
		});

		it('should use decryptText method from crypto service for each message to decrypt messages', async (): Promise<void> => {
			const page: number = 1;
			const take: number = 10;

			await directChatsService.getLastChats(userIdMock, page, take);

			const chats: DirectChat[] = await directChatsRepository.getLastChats(
				userIdMock,
				page * take - take,
				take,
			);

			expect(decryptTextMock).toHaveBeenCalledTimes(chats.length);

			for (let i = 1; i <= chats.length; i += 1) {
				expect(decryptTextMock).toHaveBeenNthCalledWith(i, chats[i - 1].messages[0].messageText);
			}
		});

		it('should provide default values for getLastChats method if page or take not provided', async (): Promise<void> => {
			await directChatsService.getLastChats(userIdMock);

			expect(getLastChatsMock).toHaveBeenCalledTimes(1);
			expect(getLastChatsMock).toHaveBeenCalledWith(userIdMock, 0, 10);
		});

		it('should return response as instance of Array', async (): Promise<void> => {
			const chats: DirectChatShortDto[] = await directChatsService.getLastChats(userIdMock);

			expect(chats).toBeInstanceOf(Array);
		});

		it('should return each chat as instance of DirectChatShortDto', async (): Promise<void> => {
			const chats: DirectChatShortDto[] = await directChatsService.getLastChats(userIdMock);

			chats.forEach((chat: DirectChatShortDto) => {
				expect(chat).toBeInstanceOf(DirectChatShortDto);
			});
		});
	});
});
