import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	UnprocessableEntityException,
} from '@nestjs/common';

import { IDirectChatsService, IUsersService } from '@services';
import { IDecryptionStrategyManager } from '@services/crypto/decryptionStrategy';

import { DirectChat } from '@entities';

import { CustomProvider } from '@enums';

import { IDirectChatsRepository } from '@repositories';

import { UserDto } from '@dtos/users';
import { DirectChatWithUsersAndMessagesDto } from '@dtos/directChats';

import { DateHelper, TransformHelper, PaginationHelper } from '@helpers';

@Injectable()
export class DirectChatsService implements IDirectChatsService {
	constructor(
		@Inject(CustomProvider.CTF_DIRECT_CHATS_REPOSITORY)
		private readonly _directChatsRepository: IDirectChatsRepository,

		@Inject(CustomProvider.CTF_USERS_SERVICE)
		private readonly _usersService: IUsersService,

		@Inject(CustomProvider.CTF_DECRYPTION_STRATEGY_MANAGER)
		private readonly _decryptionStrategyManager: IDecryptionStrategyManager,
	) {}

	public async getUserLastChats(
		userId: string,
		page: number,
		take: number,
	): Promise<DirectChatWithUsersAndMessagesDto[]> {
		const { skip: skipRecords, take: takeRecords } = PaginationHelper.toSqlPagination(page, take);

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
}
