import { DirectChat } from '@Entities/DirectChat.entity';
import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import { IDirectChatRepository } from '@Interfaces/directChats/IDirectChatRepository';
import { IAppLogger } from '@Interfaces/logger/IAppLogger';
import { AppLogger } from '@Logger/app.logger';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager, InsertResult } from 'typeorm';

@Injectable()
export class DirectChatsRepository implements IDirectChatRepository {
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
			repository: 'AccountSettingsRepository',
			data: { id: createdChatId },
		});

		return createdChatId;
	}
}
