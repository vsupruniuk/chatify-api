import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { DirectChatMessagesService } from '@services';
import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { providers } from '@modules/providers';

import { CustomProvider } from '@enums';

import { IDirectChatsRepository, IDirectChatMessagesRepository } from '@repositories';

import { PaginationHelper } from '@helpers';

import { DirectChat, DirectChatMessage, User } from '@entities';

import { directChats, users, directChatsMessages } from '@testMocks';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

describe('Direct chat messages service', (): void => {
	let directChatMessagesService: DirectChatMessagesService;
	let directChatsRepository: IDirectChatsRepository;
	let directChatMessagesRepository: IDirectChatMessagesRepository;
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
		directChatsRepository = moduleFixture.get(CustomProvider.CTF_DIRECT_CHATS_REPOSITORY);
		directChatMessagesRepository = moduleFixture.get(
			CustomProvider.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,
		);
		decryptionStrategyManager = moduleFixture.get(CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER);
	});

	describe('Get chat messages', (): void => {
		const directChatMock: DirectChat = directChats[0];
		const directChatMessagesMock: DirectChatMessage[] = directChatsMessages.slice(0, 3);
		const usersMock: User[] = users.slice(1, 3);

		const userId: string = usersMock[0].id;
		const directChatId: string = directChatMock.id;
		const page: number = 0;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(PaginationHelper, 'toSqlPagination').mockReturnValue({ skip: page, take });

			jest
				.spyOn(directChatsRepository, 'findByIdWithUsers')
				.mockResolvedValue({ ...directChatMock, users: [...usersMock] });

			jest
				.spyOn(directChatMessagesRepository, 'findLastMessagesByDirectChatId')
				.mockResolvedValue(directChatMessagesMock);

			jest.spyOn(decryptionStrategyManager, 'decrypt').mockImplementation(async (data: object) => {
				return plainToInstance(DirectChatMessageWithChatAndUserDto, data, {
					excludeExtraneousValues: true,
				});
			});
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call to sql pagination method from pagination helper to create pagination parameters for repository method', async (): Promise<void> => {
			await directChatMessagesService.getChatMessages(userId, directChatId, page, take);

			expect(PaginationHelper.toSqlPagination).toHaveBeenCalledTimes(1);
			expect(PaginationHelper.toSqlPagination).toHaveBeenNthCalledWith(1, page, take);
		});

		it('should call find by id with users method from direct chats repository to find a chat by id', async (): Promise<void> => {
			await directChatMessagesService.getChatMessages(userId, directChatId, page, take);

			expect(directChatsRepository.findByIdWithUsers).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.findByIdWithUsers).toHaveBeenNthCalledWith(1, directChatId);
		});

		it('should throw not found exception if direct chat was not found', async (): Promise<void> => {
			jest.spyOn(directChatsRepository, 'findByIdWithUsers').mockResolvedValue(null);

			await expect(
				directChatMessagesService.getChatMessages(userId, directChatId, page, take),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw bad request exception if user id does not match with any of chat users ids', async (): Promise<void> => {
			await expect(
				directChatMessagesService.getChatMessages('fakeUserId', directChatId, page, take),
			).rejects.toThrow(BadRequestException);
		});

		it('should call find last messages by direct chat id method from direct chat message repository to get last chat messages', async (): Promise<void> => {
			await directChatMessagesService.getChatMessages(userId, directChatId, page, take);

			expect(directChatMessagesRepository.findLastMessagesByDirectChatId).toHaveBeenCalledTimes(1);
			expect(directChatMessagesRepository.findLastMessagesByDirectChatId).toHaveBeenNthCalledWith(
				1,
				directChatId,
				page,
				take,
			);
		});

		it('should call decrypt method from decryption strategy manager to decrypt each founded message', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatMessagesService.getChatMessages(userId, directChatId, page, take);

			expect(decryptionStrategyManager.decrypt).toHaveBeenCalledTimes(messages.length);

			messages.forEach((message: DirectChatMessageWithChatAndUserDto, index: number) => {
				expect(decryptionStrategyManager.decrypt).toHaveBeenNthCalledWith(index + 1, message);
			});
		});

		it('should return response as array of DirectChatMessageWithChatAndUserDto', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatMessagesService.getChatMessages(userId, directChatId, page, take);

			expect(messages).toBeInstanceOf(Array);

			messages.forEach((message: DirectChatMessageWithChatAndUserDto) => {
				expect(message).toBeInstanceOf(DirectChatMessageWithChatAndUserDto);
			});
		});

		it('should return found messages', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatMessagesService.getChatMessages(userId, directChatId, page, take);

			expect(messages.sort()).toEqual(
				directChatMessagesMock
					.map((message: DirectChatMessage) =>
						plainToInstance(DirectChatMessageWithChatAndUserDto, message, {
							excludeExtraneousValues: true,
						}),
					)
					.sort(),
			);
		});
	});
});
