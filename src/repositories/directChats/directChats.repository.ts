import { DirectChat } from '@db/entities/DirectChat.entity';
import { Injectable } from '@nestjs/common';
import { IDirectChatsRepository } from '@repositories/directChats/IDirectChatsRepository';
import { DataSource, EntityManager, InsertResult, ObjectLiteral } from 'typeorm';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { UserDto } from '@dtos/users/UserDto';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';

@Injectable()
export class DirectChatsRepository implements IDirectChatsRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async findById(id: string): Promise<DirectChat | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('direct_chat')
			.from(DirectChat, 'direct_chat')
			.where('direct_chat.id = :id', { id })
			.getOne();
	}

	public async findByIdWithUsers(id: string): Promise<DirectChat | null> {
		return await this._dataSource
			.createQueryBuilder()
			.select('direct_chat')
			.from(DirectChat, 'direct_chat')
			.leftJoinAndSelect('direct_chat.users', 'users')
			.where('direct_chat.id = :id', { id })
			.getOne();
	}

	public async findByUsersIds(
		firstUserId: string,
		secondUserId: string,
	): Promise<DirectChat | null> {
		const chatWithFirstUserExistCondition: SelectQueryBuilder<ObjectLiteral> = this._dataSource
			.createQueryBuilder()
			.select('*')
			.from('direct_chats_users', 'direct_chats_users')
			.where('direct_chats_users.direct_chat_id = direct_chat.id')
			.andWhere('direct_chats_users.user_id = :userId', { userId: firstUserId });

		const chatWithSecondUserExistCondition: SelectQueryBuilder<ObjectLiteral> = this._dataSource
			.createQueryBuilder()
			.select('*')
			.from('direct_chats_users', 'direct_chats_users')
			.where('direct_chats_users.direct_chat_id = direct_chat.id')
			.andWhere('direct_chats_users.user_id = :userId', { userId: secondUserId });

		return await this._dataSource
			.createQueryBuilder()
			.select('direct_chat')
			.from(DirectChat, 'direct_chat')
			.whereExists(chatWithFirstUserExistCondition)
			.andWhereExists(chatWithSecondUserExistCondition)
			.getOne();
	}

	public async findLastChatsByUserId(
		userId: string,
		skip: number,
		take: number,
	): Promise<DirectChat[]> {
		const lastMessageSubQuery: string = this._dataSource
			.createQueryBuilder()
			.select('direct_chat_message.id')
			.from(DirectChatMessage, 'direct_chat_message')
			.where('direct_chat_message.direct_chat_id = direct_chat.id')
			.orderBy('direct_chat_message.updated_at', 'DESC')
			.limit(1)
			.getQuery();

		const userDirectChatsSubQuery: string = this._dataSource
			.createQueryBuilder()
			.select('direct_chats_users.direct_chat_id')
			.from('direct_chats_users', 'direct_chats_users')
			.where('direct_chats_users.user_id = :userId')
			.getQuery();

		return await this._dataSource
			.createQueryBuilder()
			.select('direct_chat')
			.from(DirectChat, 'direct_chat')
			.leftJoinAndSelect('direct_chat.users', 'users')
			.leftJoinAndMapMany(
				'direct_chat.messages',
				DirectChatMessage,
				'last_message',
				`last_message.id = (${lastMessageSubQuery})`,
			)
			.leftJoinAndSelect('last_message.sender', 'sender')
			.where(`direct_chat.id IN (${userDirectChatsSubQuery})`)
			.setParameters({ userId })
			.orderBy('last_message.updatedAt', 'DESC')
			.skip(skip)
			.take(take)
			.getMany();
	}

	public async createChat(
		sender: UserDto,
		receiver: UserDto,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChat | null> {
		return await this._dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
			const chatInsertResult: InsertResult = await transactionalEntityManager
				.createQueryBuilder()
				.insert()
				.into(DirectChat)
				.values({})
				.returning('*')
				.execute();

			for (const user of [sender, receiver]) {
				await transactionalEntityManager
					.createQueryBuilder()
					.relation(DirectChat, 'users')
					.of(chatInsertResult.generatedMaps[0])
					.add(user);
			}

			await transactionalEntityManager
				.createQueryBuilder()
				.insert()
				.into(DirectChatMessage)
				.values({
					dateTime: messageDateTime,
					messageText: messageText,
					directChat: chatInsertResult.generatedMaps[0],
					sender: sender,
				})
				.execute();

			const lastMessageSubQuery: string = this._dataSource
				.createQueryBuilder()
				.select('direct_chat_message.id')
				.from(DirectChatMessage, 'direct_chat_message')
				.where('direct_chat_message.direct_chat_id = direct_chat.id')
				.orderBy('direct_chat_message.updated_at', 'DESC')
				.limit(1)
				.getQuery();

			return transactionalEntityManager
				.createQueryBuilder()
				.select('direct_chat')
				.from(DirectChat, 'direct_chat')
				.leftJoinAndSelect('direct_chat.users', 'users')
				.leftJoinAndMapMany(
					'direct_chat.messages',
					DirectChatMessage,
					'last_message',
					`last_message.id = (${lastMessageSubQuery})`,
				)
				.leftJoinAndSelect('last_message.sender', 'sender')
				.where('direct_chat.id = :id', { id: chatInsertResult.generatedMaps[0].id })
				.getOne();
		});
	}
}
