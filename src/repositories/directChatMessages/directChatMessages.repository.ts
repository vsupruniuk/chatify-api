import { Injectable } from '@nestjs/common';
import { IDirectChatMessagesRepository } from '@repositories/directChatMessages/IDirectChatMessagesRepository';
import { DataSource, EntityManager, InsertResult } from 'typeorm';
import { DirectChat } from '@entities/DirectChat.entity';
import { DirectChatMessage } from '@entities/DirectChatMessage.entity';
import { UserDto } from '@dtos/users/UserDto';

@Injectable()
export class DirectChatMessagesRepository implements IDirectChatMessagesRepository {
	constructor(private readonly _dataSource: DataSource) {}

	public async findLastMessagesByDirectChatId(
		directChatId: string,
		skip: number,
		take: number,
	): Promise<DirectChatMessage[]> {
		return await this._dataSource
			.createQueryBuilder()
			.select('direct_chat_messages')
			.from(DirectChatMessage, 'direct_chat_messages')
			.leftJoinAndSelect('direct_chat_messages.directChat', 'directChat')
			.leftJoinAndSelect('directChat.users', 'direct_chat_users')
			.leftJoinAndSelect('direct_chat_messages.sender', 'sender')
			.where('direct_chat_messages.direct_chat_id = :directChatId', { directChatId })
			.orderBy('direct_chat_messages.createdAt', 'DESC')
			.skip(skip)
			.take(take)
			.getMany();
	}

	public async createMessage(
		sender: UserDto,
		directChat: DirectChat,
		messageText: string,
		messageDateTime: string,
	): Promise<DirectChatMessage | null> {
		return this._dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
			const insertMessageResult: InsertResult = await transactionalEntityManager
				.createQueryBuilder()
				.insert()
				.into(DirectChatMessage)
				.values({ dateTime: messageDateTime, messageText, directChat, sender })
				.execute();

			return await transactionalEntityManager
				.createQueryBuilder()
				.select('direct_chat_message')
				.from(DirectChatMessage, 'direct_chat_message')
				.leftJoinAndSelect('direct_chat_message.directChat', 'directChat')
				.leftJoinAndSelect('direct_chat_message.sender', 'sender')
				.leftJoinAndSelect('directChat.users', 'direct_chat_users')
				.where('direct_chat_message.id = :id', { id: insertMessageResult.identifiers[0].id })
				.getOne();
		});
	}
}
