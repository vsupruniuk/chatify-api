import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import { IDirectChatsRepository } from '@Interfaces/directChats/IDirectChatsRepository';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, EntityManager, InsertResult } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

@Injectable()
export class DirectChatsRepository implements IDirectChatsRepository {
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
				.andWhere('user.isActivated = :isActivated', { isActivated: true })
				.getOne();

			const receiver: User | null = await transactionalEntityManager
				.createQueryBuilder()
				.select('user')
				.from(User, 'user')
				.where('user.id = :id', { id: receiverId })
				.andWhere('user.isActivated = :isActivated', { isActivated: true })
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

		return await this._dataSource
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

	public async createMessage(
		senderId: string,
		directChatId: string,
		messageText: string,
		messageDateTime: string,
	): Promise<string> {
		const sender: User | null = await this._dataSource
			.createQueryBuilder()
			.select('user')
			.from(User, 'user')
			.where('user.id = :id', { id: senderId })
			.getOne();

		if (!sender) {
			throw new NotFoundException('Message sender does not exist');
		}

		const directChat: DirectChat | null = await this._dataSource
			.createQueryBuilder()
			.select('directChat')
			.from(DirectChat, 'directChat')
			.where('directChat.id = :id', { id: directChatId })
			.getOne();

		if (!directChat) {
			throw new NotFoundException('Direct chat with this id does not exist');
		}

		const result: InsertResult = await this._dataSource
			.createQueryBuilder()
			.insert()
			.into(DirectChatMessage)
			.values({ dateTime: messageDateTime, messageText, directChat, sender })
			.execute();

		return result.identifiers[0].id;
	}

	public async getMessageById(messageId: string): Promise<DirectChatMessage | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('directChatMessage')
			.from(DirectChatMessage, 'directChatMessage')
			.leftJoinAndSelect('directChatMessage.directChat', 'directChat')
			.leftJoinAndSelect('directChatMessage.sender', 'sender')
			.leftJoinAndSelect('directChat.users', 'directChatUsers')
			.where('directChatMessage.id = :id', { id: messageId })
			.getOne();
	}

	public async getChatById(chatId: string): Promise<DirectChat | null> {
		const lastMessageSubQuery: string = this._dataSource
			.createQueryBuilder()
			.select('directChatMessage.id')
			.from(DirectChatMessage, 'directChatMessage')
			.where('directChatMessage.directChatId = directChat.id')
			.orderBy('directChatMessage.updatedAt', 'DESC')
			.limit(1)
			.getQuery();

		return await this._dataSource
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
			.where('directChat.id = :id', { id: chatId })
			.getOne();
	}

	public async getChatByUsers(
		firstUserId: string,
		secondUserId: string,
	): Promise<DirectChat | null> {
		const chatWithFirstUserExistCondition: SelectQueryBuilder<ObjectLiteral> = this._dataSource
			.createQueryBuilder()
			.select('*')
			.from('DirectChatUsers', 'directChatUsers')
			.where('directChatUsers.directChatId = directChat.id')
			.andWhere('directChatUsers.userId = :userId', { userId: firstUserId });

		const chatWithSecondUserExistCondition: SelectQueryBuilder<ObjectLiteral> = this._dataSource
			.createQueryBuilder()
			.select('*')
			.from('DirectChatUsers', 'directChatUsers')
			.where('directChatUsers.directChatId = directChat.id')
			.andWhere('directChatUsers.userId = :userId', { userId: secondUserId });

		return await this._dataSource
			.createQueryBuilder()
			.select('directChat')
			.from(DirectChat, 'directChat')
			.whereExists(chatWithFirstUserExistCondition)
			.andWhereExists(chatWithSecondUserExistCondition)
			.getOne();
	}
}
