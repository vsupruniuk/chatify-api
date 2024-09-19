import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, EntityManager, InsertResult } from 'typeorm';

@Injectable()
export class DirectChatsRepository implements IDirectChatsRepository {
	private readonly _logger: IAppLogger = new AppLogger();

	constructor(private readonly _dataSource: DataSource) {}

	public async createChat(
		senderId: string,
		receiverId: string,
		messageText: string,
		messageDateTime: string,
	): Promise<string> {
		let createdChatId: string = '';

		await this._dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
			const sender: User | null = await transactionalEntityManager
				.createQueryBuilder()
				.select('user')
				.from(User, 'user')
				.where('user.id = :id', { id: senderId })
				.getOne();

			const receiver: User | null = await transactionalEntityManager
				.createQueryBuilder()
				.select('user')
				.from(User, 'user')
				.where('user.id = :id', { id: receiverId })
				.getOne();

			if (!sender || !receiver) {
				throw new NotFoundException('One of chat users does not exist');
			}

			const chatInsertResult: InsertResult = await transactionalEntityManager
				.createQueryBuilder()
				.insert()
				.into(DirectChat)
				.values({})
				.execute();

			const createdChat: DirectChat | null = await transactionalEntityManager
				.createQueryBuilder()
				.select('directChat')
				.from(DirectChat, 'directChat')
				.where('directChat.id = :id', { id: chatInsertResult.identifiers[0].id })
				.getOne();

			if (!createdChat) {
				throw new NotFoundException(['Failed to create chat. Please try again']);
			}

			createdChatId = createdChat.id;

			for (const user of [sender, receiver]) {
				await transactionalEntityManager
					.createQueryBuilder()
					.relation(DirectChat, 'users')
					.of(createdChat)
					.add(user);
			}

			await transactionalEntityManager
				.createQueryBuilder()
				.insert()
				.into(DirectChatMessage)
				.values({
					dateTime: messageDateTime,
					messageText: messageText,
					directChat: createdChat,
					sender: sender,
				})
				.execute();
		});

		this._logger.successfulDBQuery({
			method: this.createChat.name,
			repository: 'DirectChatsRepository',
			data: { id: createdChatId },
		});

		return createdChatId;
	}

	public async getLastChats(userId: string, skip: number, take: number): Promise<DirectChat[]> {
		const lastMessageSubQuery: string = this._dataSource
			.createQueryBuilder()
			.select('directChatMessage.id')
			.from(DirectChatMessage, 'directChatMessage')
			.where('directChatMessage.directChatId = directChat.id')
			.orderBy('directChatMessage.updatedAt', 'DESC')
			.limit(1)
			.getQuery();

		const userDirectChatsSubQuery: string = this._dataSource
			.createQueryBuilder()
			.select('DirectChatUsers.directChatId')
			.from('DirectChatUsers', 'DirectChatUsers')
			.where('DirectChatUsers.userId = :userId')
			.getQuery();

		const directChats: DirectChat[] = await this._dataSource
			.createQueryBuilder()
			.select('directChat')
			.from(DirectChat, 'directChat')
			.leftJoinAndSelect('directChat.users', 'users')
			.leftJoinAndMapMany(
				'directChat.messages',
				DirectChatMessage,
				'lastMessage',
				`lastMessage.id = (${lastMessageSubQuery})`,
			)
			.leftJoinAndSelect('lastMessage.sender', 'sender')
			.where(`directChat.id IN (${userDirectChatsSubQuery})`)
			.setParameter('userId', userId)
			.orderBy('lastMessage.updatedAt', 'DESC')
			.skip(skip)
			.take(take)
			.getMany();

		this._logger.successfulDBQuery({
			method: this.getLastChats.name,
			repository: 'DirectChatsRepository',
			data: { directChats },
		});

		return directChats;
	}

	public async getChatMessages(
		userId: string,
		directChatId: string,
		skip: number,
		take: number,
	): Promise<DirectChatMessage[]> {
		const messages: DirectChatMessage[] = await this._dataSource
			.createQueryBuilder()
			.select('directChatMessage')
			.from(DirectChatMessage, 'directChatMessage')
			.leftJoinAndSelect('directChatMessage.directChat', 'directChat')
			.leftJoinAndSelect('directChat.users', 'directChatUsers')
			.leftJoinAndSelect('directChatMessage.sender', 'sender')
			.where('directChatMessage.directChatId = :directChatId', { directChatId })
			.orderBy('directChatMessage.createdAt', 'DESC')
			.skip(skip)
			.take(take)
			.getMany();

		const directChat: DirectChat = messages[0].directChat;

		if (!directChat.users.some((user: User) => user.id === userId)) {
			throw new UnprocessableEntityException(
				'Cannot retrieve messages from the chat that not belongs to user',
			);
		}

		return messages;
	}
}
