import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { DataSource, InsertResult } from 'typeorm';
import { IDirectChatMessagesRepository } from '@Interfaces/directChatMessages/IDirectChatMessagesRepository';

@Injectable()
export class DirectChatMessagesRepository implements IDirectChatMessagesRepository {
	constructor(private readonly _dataSource: DataSource) {}

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
}
