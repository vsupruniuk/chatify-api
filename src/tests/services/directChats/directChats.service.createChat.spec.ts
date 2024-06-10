import { connectionSource } from '@DB/typeOrmConfig';
import { CreateDirectChatDto } from '@DTO/directChat/CreateDIrectChat.dto';
import { DateHelper } from '@Helpers/date.helper';
import { DirectChatsRepository } from '@Repositories/directChats.repository';
import { CryptoService } from '@Services/crypto.service';
import { DirectChatsService } from '@Services/directChats.service';
import SpyInstance = jest.SpyInstance;

describe('Direct chats', (): void => {
	let directChatsService: DirectChatsService;
	let directChatsRepository: DirectChatsRepository;
	let cryptoService: CryptoService;

	beforeAll((): void => {
		directChatsRepository = new DirectChatsRepository(connectionSource);
		cryptoService = new CryptoService();

		directChatsService = new DirectChatsService(directChatsRepository, cryptoService);
	});

	describe('createChat', (): void => {
		let createChatMock: SpyInstance;
		let encryptTextMock: SpyInstance;
		let dateTimeNowMock: SpyInstance;

		const createdChatId: string = '42f5798a-15c8-4c3e-a5f0-0be1e8760654';
		const senderId: string = 'f42845d7-90af-4c29-8e1a-227c90b33852';
		const receiverId: string = '699901e8-653f-4ac2-841e-b85388c4b89c';
		const messageText: string = 'Hello, world!';
		const dateTimeMock: string = '2024-06-10 23:25:00';

		beforeEach((): void => {
			jest.useFakeTimers();

			createChatMock = jest
				.spyOn(directChatsRepository, 'createChat')
				.mockResolvedValue(createdChatId);

			encryptTextMock = jest
				.spyOn(cryptoService, 'encryptText')
				.mockImplementation(async (text: string) => Buffer.from(text, 'utf-8').toString('base64'));

			dateTimeNowMock = jest
				.spyOn(DateHelper, 'dateTimeNow')
				.mockReturnValue(new Date(dateTimeMock).toISOString());
		});

		afterEach((): void => {
			jest.useRealTimers();
			jest.clearAllMocks();
		});

		it('should be defined', async (): Promise<void> => {
			expect(directChatsService.createChat).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.createChat).toBeInstanceOf(Function);
		});

		it('should call encryptText method in crypto service to encrypt message text', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			const createDirectChatDto: CreateDirectChatDto = {
				senderId: senderId,
				receiverId: receiverId,
				messageText,
			};

			await directChatsService.createChat(createDirectChatDto);

			expect(encryptTextMock).toHaveBeenCalledTimes(1);
			expect(encryptTextMock).toHaveBeenCalledWith(createDirectChatDto.messageText);
		});

		it('should call dateTimeNow method in date helper to set current date and time to message', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			const createDirectChatDto: CreateDirectChatDto = {
				senderId: senderId,
				receiverId: receiverId,
				messageText,
			};

			await directChatsService.createChat(createDirectChatDto);

			expect(dateTimeNowMock).toHaveBeenCalledTimes(1);
		});

		it('should call createChat method in direct chat repository to create direct chat', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			const createDirectChatDto: CreateDirectChatDto = {
				senderId: senderId,
				receiverId: receiverId,
				messageText,
			};

			await directChatsService.createChat(createDirectChatDto);

			expect(createChatMock).toHaveBeenCalledTimes(1);
			expect(createChatMock).toHaveBeenCalledWith(
				createDirectChatDto.senderId,
				createDirectChatDto.receiverId,
				await cryptoService.encryptText(createDirectChatDto.messageText),
				DateHelper.dateTimeNow(),
			);
		});

		it('should return id of created chat', async (): Promise<void> => {
			jest.setSystemTime(new Date(dateTimeMock));

			const createDirectChatDto: CreateDirectChatDto = {
				senderId: senderId,
				receiverId: receiverId,
				messageText,
			};

			const chatId: string = await directChatsService.createChat(createDirectChatDto);

			expect(chatId).toBe(createdChatId);
		});
	});
});
