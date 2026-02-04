import { Test, TestingModule } from '@nestjs/testing';

import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { providers } from '@modules/providers';

import { DirectChatsService } from '@services';
import {
	DirectChatWithUsersAndMessagesStrategy,
	DirectChatMessageWithChatAndUserStrategy,
} from '@services/crypto/decryptionStrategy/strategies';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

import { directChats, users, directChatsMessages } from '@testMocks';

import { DirectChat } from '@entities';

import { PaginationHelper } from '@helpers';

import { IDirectChatsRepository } from '@repositories';

import { CustomProvider } from '@enums';

describe('Direct chats service', (): void => {
	let directChatsService: DirectChatsService;
	let directChatsRepository: IDirectChatsRepository;
	let decryptionStrategyManager: IDecryptionStrategyManager;

	beforeAll(async (): Promise<void> => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			providers: [
				DirectChatsService,

				DirectChatWithUsersAndMessagesStrategy,
				DirectChatMessageWithChatAndUserStrategy,

				providers.CTF_DIRECT_CHATS_REPOSITORY,

				providers.CTF_DECRYPTION_STRATEGY_MANAGER,
				providers.CTF_CRYPTO_SERVICE,

				providers.CTF_USERS_SERVICE,
				providers.CTF_USERS_REPOSITORY,

				{ provide: DataSource, useValue: {} },
			],
		}).compile();

		directChatsService = moduleFixture.get(DirectChatsService);
		directChatsRepository = moduleFixture.get(CustomProvider.CTF_DIRECT_CHATS_REPOSITORY);
		decryptionStrategyManager = moduleFixture.get(CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER);
	});

	describe('Get user last chats', (): void => {
		const userId: string = users[2].id;
		const page: number = 0;
		const take: number = 10;

		const lastChatsMock: DirectChat[] = [
			{
				...directChats[2],
				users: users.slice(2, 4),
				messages: directChatsMessages.slice(2, 4),
			},
		];

		beforeEach((): void => {
			jest.spyOn(PaginationHelper, 'toSqlPagination').mockReturnValue({ skip: page, take });
			jest.spyOn(directChatsRepository, 'findLastChatsByUserId').mockResolvedValue(lastChatsMock);
			jest.spyOn(decryptionStrategyManager, 'decrypt').mockImplementation(async (data: object) => {
				return plainToInstance(DirectChatWithUsersAndMessagesDto, data, {
					excludeExtraneousValues: true,
				});
			});
		});

		afterEach((): void => {
			jest.restoreAllMocks();
		});

		it('should call to sql pagination method from pagination helper to create pagination parameters for repository method', async (): Promise<void> => {
			await directChatsService.getUserLastChats(userId, page, take);

			expect(PaginationHelper.toSqlPagination).toHaveBeenCalledTimes(1);
			expect(PaginationHelper.toSqlPagination).toHaveBeenNthCalledWith(1, page, take);
		});

		it('should call find last chats by user id to get user last chats', async (): Promise<void> => {
			await directChatsService.getUserLastChats(userId, page, take);

			expect(directChatsRepository.findLastChatsByUserId).toHaveBeenCalledTimes(1);
			expect(directChatsRepository.findLastChatsByUserId).toHaveBeenNthCalledWith(
				1,
				userId,
				page,
				take,
			);
		});

		it('should call decrypt method from decryption strategy manager to decrypt all chats messages', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsService.getUserLastChats(
				userId,
				page,
				take,
			);

			expect(decryptionStrategyManager.decrypt).toHaveBeenCalledTimes(chats.length);

			chats.forEach((chat: DirectChatWithUsersAndMessagesDto, index: number) => {
				expect(decryptionStrategyManager.decrypt).toHaveBeenNthCalledWith(index + 1, chat);
			});
		});

		it('should return result as instance of DirectChatWithUsersAndMessagesDto', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsService.getUserLastChats(
				userId,
				page,
				take,
			);

			expect(chats).toBeInstanceOf(Array);

			chats.forEach((chat: DirectChatWithUsersAndMessagesDto) => {
				expect(chat).toBeInstanceOf(DirectChatWithUsersAndMessagesDto);
			});
		});

		it('should return all found chats', async (): Promise<void> => {
			const chats: DirectChatWithUsersAndMessagesDto[] = await directChatsService.getUserLastChats(
				userId,
				page,
				take,
			);

			const actual = chats.sort((firstChat, secondChat) =>
				firstChat.id.localeCompare(secondChat.id),
			);
			const expected = lastChatsMock
				.map((chat: DirectChat) =>
					plainToInstance(DirectChatWithUsersAndMessagesDto, chat, {
						excludeExtraneousValues: true,
					}),
				)
				.sort((firstChat, secondChat) => firstChat.id.localeCompare(secondChat.id));

			expect(actual).toEqual(expected);
		});
	});
});
