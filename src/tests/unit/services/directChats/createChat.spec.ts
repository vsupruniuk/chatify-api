import { DirectChatsService } from '@services/directChats/directChats.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DirectChatWithUsersAndMessagesStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatWithUsersAndMessagesStrategy';
import { DirectChatMessageWithChatAndUserStrategy } from '@services/crypto/decryptionStrategy/strategies/DirectChatMessageWithChatAndUserStrategy';
import providers from '@modules/providers/providers';
import { DataSource } from 'typeorm';
import { User } from '@entities/User.entity';
import { users } from '@testMocks/User/users';
import { IUsersService } from '@services/users/IUsersService';
import { CustomProviders } from '@enums/CustomProviders.enum';
import { IDirectChatsRepository } from '@repositories/directChats/IDirectChatsRepository';
import { DirectChat } from '@entities/DirectChat.entity';
import { directChats } from '@testMocks/DirectChat/directChats';
import { DateHelper } from '@helpers/date.helper';
import { TransformHelper } from '@helpers/transform.helper';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy/IDecryptionStrategyManager';
import { plainToInstance } from 'class-transformer';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats/DirectChatWithUsersAndMessages.dto';
import {
	BadRequestException,
	ConflictException,
	UnprocessableEntityException,
} from '@nestjs/common';

describe('Direct chat service', (): void => {
	let directChatsService: DirectChatsService;
	let directChatsRepository: IDirectChatsRepository;
	let usersService: IUsersService;
	let decryptionStrategyManager: IDecryptionStrategyManager;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsService,

				DirectChatWithUsersAndMessagesStrategy,
				DirectChatMessageWithChatAndUserStrategy,

				providers.CTF_DIRECT_CHATS_REPOSITORY,
				providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

				providers.CTF_DECRYPTION_STRATEGY_MANAGER,
				providers.CTF_CRYPTO_SERVICE,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		directChatsService = moduleFixture.get(DirectChatsService);
		directChatsRepository = moduleFixture.get(CustomProviders.CTF_DIRECT_CHATS_REPOSITORY);
		usersService = moduleFixture.get(CustomProviders.CTF_USERS_SERVICE);
		decryptionStrategyManager = moduleFixture.get(CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER);
	});

	describe('Create chat', (): void => {
		const senderMock: User = users[3];
		const receiverMock: User = users[4];
		const directChatMock: DirectChat = directChats[0];
		const dateTimeMock: string = '2025-05-28 00:05:00';

		const senderId: string = senderMock.id;
		const receiverId: string = receiverMock.id;
		const messageText: string = "This is my secret. I'm always angry";

		beforeEach((): void => {
			jest.spyOn(usersService, 'getAllByIds').mockResolvedValue([senderMock, receiverMock]);

			jest.spyOn(directChatsRepository, 'findByUsersIds').mockResolvedValue(null);
			jest.spyOn(directChatsRepository, 'createChat').mockResolvedValue(directChatMock);

			jest.spyOn(decryptionStrategyManager, 'decrypt').mockImplementation(async (data: object) => {
				return plainToInstance(DirectChatWithUsersAndMessagesDto, data, {
					excludeExtraneousValues: true,
				});
			});

			jest.spyOn(DateHelper, 'dateTimeNow').mockReturnValue(dateTimeMock);
			jest.spyOn(TransformHelper, 'toTargetDto');
		});

		afterEach((): void => {
			jest.restoreAllMocks();
			jest.clearAllMocks();
		});

		it('should be defined', () => {
			expect(directChatsService.createChat).toBeDefined();
		});

		it('should be a function', (): void => {
			expect(directChatsService.createChat).toBeInstanceOf(Function);
		});

		it('should call get all by ids to find both chat users', async (): Promise<void> => {
			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(usersService.getAllByIds).toHaveBeenCalledTimes(1);
			expect(usersService.getAllByIds).toHaveBeenNthCalledWith(1, [senderId, receiverId]);
		});

		it('should throw bad request exception if sender was not found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getAllByIds').mockResolvedValue([receiverMock]);

			await expect(
				directChatsService.createChat(senderId, receiverId, messageText),
			).rejects.toThrow(BadRequestException);
		});

		it('should throw bad request exception if receiver was not found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getAllByIds').mockResolvedValue([senderMock]);

			await expect(
				directChatsService.createChat(senderId, receiverId, messageText),
			).rejects.toThrow(BadRequestException);
		});

		it('should call find by users ids method from direct chats repository to find existing chat', async (): Promise<void> => {
			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(directChatsRepository.findByUsersIds).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.findByUsersIds).toHaveBeenNthCalledWith(1, senderId, receiverId);
		});

		it('should throw conflict exception if direct chat between users already exist', async (): Promise<void> => {
			jest.spyOn(directChatsRepository, 'findByUsersIds').mockResolvedValue(directChatMock);

			await expect(
				directChatsService.createChat(senderId, receiverId, messageText),
			).rejects.toThrow(ConflictException);
		});

		it('should call date time now from date helper to generate date and time of initial message', async (): Promise<void> => {
			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(DateHelper.dateTimeNow).toHaveBeenCalledTimes(1);
		});

		it('should call create chat method from direct chats repository to create a chat', async (): Promise<void> => {
			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(directChatsRepository.createChat).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.createChat).toHaveBeenNthCalledWith(
				1,
				senderMock,
				receiverMock,
				messageText,
				dateTimeMock,
			);
		});

		it('should throw unprocessable entity exception if repository failed to create a chat', async () => {
			jest.spyOn(directChatsRepository, 'createChat').mockResolvedValue(null);

			await expect(
				directChatsService.createChat(senderId, receiverId, messageText),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should call to target dto method from transform helper to transform response to appropriate dto', async (): Promise<void> => {
			await directChatsService.createChat(senderId, receiverId, messageText);

			expect(TransformHelper.toTargetDto).toHaveBeenCalledTimes(1);
			expect(TransformHelper.toTargetDto).toHaveBeenNthCalledWith(
				1,
				DirectChatWithUsersAndMessagesDto,
				directChatMock,
			);
		});

		it('should should call decrypt method from decryption strategy manager to decrypt messages in the chat', async (): Promise<void> => {
			const chat: DirectChatWithUsersAndMessagesDto = await directChatsService.createChat(
				senderId,
				receiverId,
				messageText,
			);

			expect(decryptionStrategyManager.decrypt).toHaveBeenCalledTimes(1);
			expect(decryptionStrategyManager.decrypt).toHaveBeenNthCalledWith(1, chat);
		});

		it('should return response as instance of DirectChatWithUsersAndMessagesDto', async (): Promise<void> => {
			const chat: DirectChatWithUsersAndMessagesDto = await directChatsService.createChat(
				senderId,
				receiverId,
				messageText,
			);

			expect(chat).toBeInstanceOf(DirectChatWithUsersAndMessagesDto);
		});
	});
});
