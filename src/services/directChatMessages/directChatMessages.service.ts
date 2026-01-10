import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';

import { IDirectChatMessagesService, IUsersService } from '@services';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { DirectChatMessageWithChatAndUserDto } from '@dtos/directChatMessages';
import { UserDto } from '@dtos/users';

import { DateHelper, PaginationHelper, TransformHelper } from '@helpers';

import { DirectChat, DirectChatMessage, User } from '@entities';

import { CustomProvider } from '@enums';

import { IDirectChatMessagesRepository, IDirectChatsRepository } from '@repositories';

@Injectable()
export class DirectChatMessagesService implements IDirectChatMessagesService {
	constructor(
		@Inject(CustomProvider.CTF_DIRECT_CHATS_REPOSITORY)
		private readonly _directChatsRepository: IDirectChatsRepository,

		@Inject(CustomProvider.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER)
		private readonly _decryptionStrategyManager: IDecryptionStrategyManager,

		@Inject(CustomProvider.CTF_DIRECT_CHAT_MESSAGES_REPOSITORY)
		private readonly _directChatMessagesRepository: IDirectChatMessagesRepository,
	) {}

	public async getChatMessages(
		userId: string,
		directChatId: string,
		page: number,
		take: number,
	): Promise<DirectChatMessageWithChatAndUserDto[]> {
		const { skip: skipRecords, take: takeRecords } = PaginationHelper.toSqlPagination(page, take);

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

	public async createMessage(
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
