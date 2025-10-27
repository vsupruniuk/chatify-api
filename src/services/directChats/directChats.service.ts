import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';

import { IDirectChatsService, IUsersService } from '@services';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { DirectChat, DirectChatMessage, User } from '@entities';

import { CustomProviders } from '@enums';

import { IDirectChatsRepository, IDirectChatMessagesRepository } from '@repositories';

import { UserDto } from '@dtos/users';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';
import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';

import { DateHelper, TransformHelper, PaginationHelper } from '@helpers';

@Injectable()
export class DirectChatsService implements IDirectChatsService {
	constructor(
		@Inject(CustomProviders.CTF_DIRECT_CHATS_REPOSITORY)
		private readonly _directChatsRepository: IDirectChatsRepository,

		@Inject(CustomProviders.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProviders.CTF_DECRYPTION_STRATEGY_MANAGER)
		private readonly _decryptionStrategyManager: IDecryptionStrategyManager,

		@Inject(CustomProviders.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY)
		private readonly _directChatMessagesRepository: IDirectChatMessagesRepository,
	) {}

	public async getUserLastChats(
		userId: string,
		page: number,
		take: number,
	): Promise<DirectChatWithUsersAndMessagesDto[]> {
		const { skip: skipRecords, take: takeRecords } = PaginationHelper.toSQLPagination(page, take);

		const chats: DirectChat[] = await this._directChatsRepository.findLastChatsByUserId(
			userId,
			skipRecords,
			takeRecords,
		);

		return await Promise.all(
			chats.map(async (chat: DirectChat) => {
				return await this._decryptionStrategyManager.decrypt(
					TransformHelper.toTargetDto(DirectChatWithUsersAndMessagesDto, chat),
				);
			}),
		);
	}

	public async getChatMessages(
		userId: string,
		directChatId: string,
		page: number,
		take: number,
	): Promise<DirectChatMessageWithChatAndUserDto[]> {
		const { skip: skipRecords, take: takeRecords } = PaginationHelper.toSQLPagination(page, take);

		const chat: DirectChat | null =
			await this._directChatsRepository.findByIdWithUsers(directChatId);

		if (!chat) {
			throw new NotFoundException('Chat with provided id does not exist');
		}

		if (!chat.users.some((user: User) => user.id === userId)) {
			throw new BadRequestException('User does not belong to this chat');
		}

		const messages: DirectChatMessage[] =
			await this._directChatMessagesRepository.findLastMessagesByDirectChatId(
				directChatId,
				skipRecords,
				takeRecords,
			);

		return await Promise.all(
			messages.map(async (message: DirectChatMessage) => {
				return await this._decryptionStrategyManager.decrypt(
					TransformHelper.toTargetDto(DirectChatMessageWithChatAndUserDto, message),
				);
			}),
		);
	}

	public async createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
	): Promise<DirectChatWithUsersAndMessagesDto> {
		const chatUsers: UserDto[] = await this._usersService.getAllByIds([senderId, receiverId]);

		const isBothUsersExist: boolean = [senderId, receiverId].every((id: string) =>
			chatUsers.some((user: UserDto) => user.id === id),
		);

		if (!isBothUsersExist) {
			throw new BadRequestException('One of the chat members does not exist');
		}

		const existingChat: DirectChat | null = await this._directChatsRepository.findByUsersIds(
			senderId,
			receiverId,
		);

		if (existingChat) {
			throw new ConflictException('Direct chat between these users already exists');
		}

		const sender: UserDto = chatUsers[0].id === senderId ? chatUsers[0] : chatUsers[1];
		const receiver: UserDto = chatUsers[0].id === receiverId ? chatUsers[0] : chatUsers[1];

		const createdChat: DirectChat | null = await this._directChatsRepository.createChat(
			sender,
			receiver,
			messageText,
			DateHelper.dateTimeNow(),
		);

		if (!createdChat) {
			throw new UnprocessableEntityException('Failed to create chat. Please, try again');
		}

		return await this._decryptionStrategyManager.decrypt(
			TransformHelper.toTargetDto(DirectChatWithUsersAndMessagesDto, createdChat),
		);
	}

	public async sendMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
	): Promise<DirectChatMessageWithChatAndUserDto> {
		const user: UserDto | null = await this._usersService.getById(senderId);

		if (!user) {
			throw new NotFoundException('User with provided id does not exist');
		}

		const directChat: DirectChat | null = await this._directChatsRepository.findById(directChatId);

		if (!directChat) {
			throw new NotFoundException('Direct chat with provided id does not exist');
		}

		const createdMessage: DirectChatMessage | null =
			await this._directChatMessagesRepository.createMessage(
				user,
				directChat,
				messageText,
				DateHelper.dateTimeNow(),
			);

		if (!createdMessage) {
			throw new UnprocessableEntityException('Failed to create message. Please try again');
		}

		return await this._decryptionStrategyManager.decrypt(
			TransformHelper.toTargetDto(DirectChatMessageWithChatAndUserDto, createdMessage),
		);
	}
}
