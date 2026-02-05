import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { DataSource } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { DirectChatsController } from '@controllers';

import { providers } from '@modules/providers';

import { IDirectChatsService } from '@services';
import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';

import { CustomProvider } from '@enums';

import { JwtPayloadDto } from '@dtos/jwt';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

import { User, DirectChat } from '@entities';

import { users, directChats } from '@testMocks';

describe('Direct chats controller', (): void => {
	let directChatsController: DirectChatsController;
	let directChatsService: IDirectChatsService;

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
		directChatsService = moduleFixture.get(CustomProvider.CTF_DIRECT_CHATS_SERVICE);
	});

	describe('Get last chats', (): void => {
		const userMock: User = users[2];
		const directChatsMock: DirectChat[] = directChats.slice(1, 3);

		const appUserPayload: JwtPayloadDto = plainToInstance(JwtPayloadDto, userMock, {
			excludeExtraneousValues: true,
		});
		const page: number = 1;
		const take: number = 10;

		beforeEach((): void => {
			jest.spyOn(directChatsService, 'getUserLastChats').mockResolvedValue(
				directChatsMock.map((chat: DirectChat) => {
					return plainToInstance(DirectChatWithUsersAndMessagesDto, chat, {
						excludeExtraneousValues: true,
					});
				}),
			);
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call get user last chats from direct chats service to obtain last chats', async (): Promise<void> => {
			await directChatsController.getLastChats(appUserPayload, { page, take });

			expect(directChatsService.getUserLastChats).toHaveBeenCalledTimes(1);
			expect(directChatsService.getUserLastChats).toHaveBeenNthCalledWith(
				1,
				appUserPayload.id,
				page,
				take,
			);
		});

		it('should return empty array if no chats were found', async (): Promise<void> => {
			jest.spyOn(directChatsService, 'getUserLastChats').mockResolvedValue([]);

			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				{ page, take },
			);

			expect(chats).toHaveLength(0);
		});

		it('should return all found chats', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				{ page, take },
			);

			const actual = chats.toSorted((firstChat, secondChat) =>
				firstChat.id.localeCompare(secondChat.id),
			);
			const expected = directChatsMock
				.map((chat: DirectChat) =>
					plainToInstance(DirectChatWithUsersAndMessagesDto, chat, {
						excludeExtraneousValues: true,
					}),
				)
				.sort((firstChat, secondChat) => firstChat.id.localeCompare(secondChat.id));

			expect(actual).toEqual(expected);
		});

		it('should return all found chats as array of DirectChatWithUsersAndMessagesDto', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsController.getLastChats(
				appUserPayload,
				{ page, take },
			);

			expect(chats).toBeInstanceOf(Array);

			chats.forEach((chat: DirectChatWithUsersAndMessagesDto) => {
				expect(chat).toBeInstanceOf(DirectChatWithUsersAndMessagesDto);
			});
		});
	});
});
