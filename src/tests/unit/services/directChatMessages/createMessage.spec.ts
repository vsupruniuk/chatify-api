import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { DirectChatMessagesService, IUsersService } from '@services';
import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { providers } from '@modules/providers';

import { User, DirectChat, DirectChatMessage } from '@entities';

import { users, directChats, directChatsMessages } from '@testMocks';

import { CustomProvider } from '@enums';

import { IDirectChatsRepository, IDirectChatMessagesRepository } from '@repositories';

import { DateHelper } from '@helpers';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

describe('Direct chat messages service', (): void => {
	let directChatMessagesService: DirectChatMessagesService;
	let directChatsRepository: IDirectChatsRepository;
	let directChatMessagesRepository: IDirectChatMessagesRepository;
	let usersService: IUsersService;
	let decryptionStrategyManager: IDecryptionStrategyManager;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatMessagesService,

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

		directChatMessagesService = moduleFixture.get(DirectChatMessagesService);
		usersService = moduleFixture.get(CustomProvider.CTF_USERS_SERVICE);
		directChatsRepository = moduleFixture.get(CustomProvider.CTF_DIRECT_CHATS_REPOSITORY);
		directChatMessagesRepository = moduleFixture.get(
			CustomProvider.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
		);
		decryptionStrategyManager = moduleFixture.get(CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER);
	});

	describe('Create message', (): void => {
		const senderMock: User = users[4];
		const directChatMock: DirectChat = directChats[3];
		const directChatMessageMock: DirectChatMessage = directChatsMessages[3];
		const dateTimeMock: string = '2025-05-31 16:45:00';

		const senderId: string = senderMock.id;
		const directChatId: string = directChatMock.id;
		const messageText: string = 'Bring me Thanos!';

		beforeEach((): void => {
			jest.spyOn(usersService, 'getById').mockResolvedValue(senderMock);
			jest.spyOn(directChatsRepository, 'findById').mockResolvedValue(directChatMock);
			jest
				.spyOn(directChatMessagesRepository, 'createMessage')
				.mockResolvedValue(directChatMessageMock);

			jest.spyOn(decryptionStrategyManager, 'decrypt').mockImplementation(async (data: object) => {
				return plainToInstance(DirectChatMessageWithChatAndUserDto, data, {
					excludeExtraneousValues: true,
				});
			});

			jest.spyOn(DateHelper, 'dateTimeNow').mockReturnValue(dateTimeMock);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get by id method from user service to find message sender', async (): Promise<void> => {
			await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(usersService.getById).toHaveBeenCalledTimes(1);
			expect(usersService.getById).toHaveBeenNthCalledWith(1, senderId);
		});

		it('should throw not found exception if message sender was not found', async (): Promise<void> => {
			jest.spyOn(usersService, 'getById').mockResolvedValue(null);

			await expect(
				directChatMessagesService.createMessage(senderId, directChatId, messageText),
			).rejects.toThrow(NotFoundException);
		});

		it('should call find by id method from direct chat repository to find a message related chat', async (): Promise<void> => {
			await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(directChatsRepository.findById).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.findById).toHaveBeenNthCalledWith(1, directChatId);
		});

		it('should throw now found exception if message related direct chat was not found', async (): Promise<void> => {
			jest.spyOn(directChatsRepository, 'findById').mockResolvedValue(null);

			await expect(
				directChatMessagesService.createMessage(senderId, directChatId, messageText),
			).rejects.toThrow(NotFoundException);
		});

		it('should call date time now method from date helper to generate message date and time', async (): Promise<void> => {
			await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(DateHelper.dateTimeNow).toHaveBeenCalledTimes(1);
		});

		it('should call create message method from direct chat messages repository to create message', async (): Promise<void> => {
			await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(directChatMessagesRepository.createMessage).toHaveBeenCalledTimes(1);
			expect(directChatMessagesRepository.createMessage).toHaveBeenNthCalledWith(
				1,
				senderMock,
				directChatMock,
				messageText,
				dateTimeMock,
			);
		});

		it('should throw unprocessable entity exception if repository failed to create a message', async (): Promise<void> => {
			jest.spyOn(directChatMessagesRepository, 'createMessage').mockResolvedValue(null);

			await expect(
				directChatMessagesService.createMessage(senderId, directChatId, messageText),
			).rejects.toThrow(UnprocessableEntityException);
		});

		it('should call decrypt method from decryption strategy manager to decrypt message', async (): Promise<void> => {
			const message: DirectChatMessageWithChatAndUserDto =
				await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(decryptionStrategyManager.decrypt).toHaveBeenCalledTimes(1);
			expect(decryptionStrategyManager.decrypt).toHaveBeenNthCalledWith(1, message);
		});

		it('should return response as instance of DirectChatMessageWithChatAndUserDto', async (): Promise<void> => {
			const message: DirectChatMessageWithChatAndUserDto =
				await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(message).toBeInstanceOf(DirectChatMessageWithChatAndUserDto);
		});

		it('should return created message', async (): Promise<void> => {
			const message: DirectChatMessageWithChatAndUserDto =
				await directChatMessagesService.createMessage(senderId, directChatId, messageText);

			expect(message).toEqual(
				plainToInstance(DirectChatMessageWithChatAndUserDto, directChatMessageMock, {
					excludeExtraneousValues: true,
				}),
			);
		});
	});
});
