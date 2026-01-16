import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { DirectChatsController } from '@controllers';

import { providers } from '@modules/providers';

import { IDirectChatMessagesService } from '@services';
import {
	DirectChatMessageWithChatAndUserStrategy,
	DirectChatWithUsersAndMessagesStrategy,
} from '@services/crypto/decryptionStrategy/strategies';

import { CustomProvider } from '@enums';

import { JwtPayloadDto } from '@dtos/jwt';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

import { User, DirectChat, DirectChatMessage } from '@entities';

import { users, directChats, directChatsMessages } from '@testMocks';

describe('Direct chats controller', (): void => {
	let directChatsController: DirectChatsController;
	let directChatMessagesService: IDirectChatMessagesService;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [DirectChatsController],
			providers: [
				DirectChatMessageWithChatAndUserStrategy,
				DirectChatWithUsersAndMessagesStrategy,

				JwtService,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				providers.CTF_JWT_TOKENS_SERVICE,
				providers.CTF_JWT_TOKENS_REPOSITORY,

				providers.CTF_DIRECT_CHATS_SERVICE,
				providers.CTF_DIRECT_CHATS_REPOSITORY,

				providers.CTF_DIRECT_CHAT_MESSAGES_SERVICE,
				providers.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY,

				providers.CTF_CRYPTO_SERVICE,

				providers.CTF_DECRYPTION_STRATEGY_MANAGER,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		directChatsController = moduleFixture.get(DirectChatsController);
		directChatMessagesService = moduleFixture.get(CustomProvider.CTF_DIRECT_CHAT_MESSAGES_SERVICE);
	});

	describe('Get chat messages', (): void => {
		const userMock: User = users[2];
		const directChatMock: DirectChat = directChats[0];
		const directChatMessagesMock: DirectChatMessage[] = directChatsMessages.slice(0, 2);

		const appUserPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const chatId: string = directChatMock.id;
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(directChatMessagesService, 'getChatMessages').mockResolvedValue(
				directChatMessagesMock.map((message: DirectChatMessage) => {
					return plainToInstance(DirectChatMessageWithChatAndUserDto, message, {
						excludeExtraneousValues: true,
					});
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get chat messages method from direct chat messages service to get chat messages', async (): Promise<void> => {
			await directChatsController.getChatMessages(appUserPayload, chatId, { page, take });

			expect(directChatMessagesService.getChatMessages).toHaveBeenCalledTimes(1);
			expect(directChatMessagesService.getChatMessages).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				chatId,
				page,
				take,
			);
		});

		it('should return empty array if no messages were found', async (): Promise<void> => {
			jest.spyOn(directChatMessagesService, 'getChatMessages').mockResolvedValue([]);

			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, { page, take });

			expect(messages).toHaveLength(0);
		});

		it('should return all found messages', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, { page, take });

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

		it('should return all found messages as array of DirectChatMessageWithChatAndUserDto', async (): Promise<void> => {
			const messages: DirectChatMessageWithChatAndUserDto[] =
				await directChatsController.getChatMessages(appUserPayload, chatId, { page, take });

			expect(messages).toBeInstanceOf(Array);

			messages.forEach((message: DirectChatMessageWithChatAndUserDto) => {
				expect(message).toBeInstanceOf(DirectChatMessageWithChatAndUserDto);
			});
		});
	});
});
