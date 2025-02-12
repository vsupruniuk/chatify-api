import { Injectable } from '@nestjs/common';
import { IDirectChatsRepository } from '@interfaces/directChats/IDirectChatsRepository';

@Injectable()
export class DirectChatsRepository implements IDirectChatsRepository {
	// constructor(private readonly _dataSource: DataSource) {}
	//
	// // TODO check if needed
	// public async createChat(
	// 	senderId: string,
	// 	receiverId: string,
	// 	messageText: string,
	// 	messageDateTime: string,
	// ): Promise<string> {
	// 	let createdChatId: string = '';
	//
	// 	await this._dataSource.transaction(async (transactionalEntityManager: EntityManager) => {
	// 		const sender: User | null = await transactionalEntityManager
	// 			.createQueryBuilder()
	// 			.select('user')
	// 			.from(User, 'user')
	// 			.where('user.id = :id', { id: senderId })
	// 			.andWhere('user.isActivated = :isActivated', { isActivated: true })
	// 			.getOne();
	//
	// 		const receiver: User | null = await transactionalEntityManager
	// 			.createQueryBuilder()
	// 			.select('user')
	// 			.from(User, 'user')
	// 			.where('user.id = :id', { id: receiverId })
	// 			.andWhere('user.isActivated = :isActivated', { isActivated: true })
	// 			.getOne();
	//
	// 		if (!sender || !receiver) {
	// 			throw new NotFoundException('One of chat users does not exist');
	// 		}
	//
	// 		const chatInsertResult: InsertResult = await transactionalEntityManager
	// 			.createQueryBuilder()
	// 			.insert()
	// 			.into(DirectChat)
	// 			.values({})
	// 			.execute();
	//
	// 		const createdChat: DirectChat | null = await transactionalEntityManager
	// 			.createQueryBuilder()
	// 			.select('directChat')
	// 			.from(DirectChat, 'directChat')
	// 			.where('directChat.id = :id', { id: chatInsertResult.identifiers[0].id })
	// 			.getOne();
	//
	// 		if (!createdChat) {
	// 			throw new NotFoundException(['Failed to create chat. Please try again']);
	// 		}
	//
	// 		createdChatId = createdChat.id;
	//
	// 		for (const user of [sender, receiver]) {
	// 			await transactionalEntityManager
	// 				.createQueryBuilder()
	// 				.relation(DirectChat, 'users')
	// 				.of(createdChat)
	// 				.add(user);
	// 		}
	//
	// 		await transactionalEntityManager
	// 			.createQueryBuilder()
	// 			.insert()
	// 			.into(DirectChatMessage)
	// 			.values({
	// 				dateTime: messageDateTime,
	// 				messageText: messageText,
	// 				directChat: createdChat,
	// 				sender: sender,
	// 			})
	// 			.execute();
	// 	});
	//
	// 	return createdChatId;
	// }
	//
	// // TODO check if needed
	// public async getLastChats(userId: string, skip: number, take: number): Promise<DirectChat[]> {
	// 	const lastMessageSubQuery: string = this._dataSource
	// 		.createQueryBuilder()
	// 		.select('directChatMessage.id')
	// 		.from(DirectChatMessage, 'directChatMessage')
	// 		.where('directChatMessage.directChatId = directChat.id')
	// 		.orderBy('directChatMessage.updatedAt', 'DESC')
	// 		.limit(1)
	// 		.getQuery();
	//
	// 	const userDirectChatsSubQuery: string = this._dataSource
	// 		.createQueryBuilder()
	// 		.select('DirectChatUsers.directChatId')
	// 		.from('DirectChatUsers', 'DirectChatUsers')
	// 		.where('DirectChatUsers.userId = :userId')
	// 		.getQuery();
	//
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('directChat')
	// 		.from(DirectChat, 'directChat')
	// 		.leftJoinAndSelect('directChat.users', 'users')
	// 		.leftJoinAndMapMany(
	// 			'directChat.messages',
	// 			DirectChatMessage,
	// 			'lastMessage',
	// 			`lastMessage.id = (${lastMessageSubQuery})`,
	// 		)
	// 		.leftJoinAndSelect('lastMessage.sender', 'sender')
	// 		.where(`directChat.id IN (${userDirectChatsSubQuery})`)
	// 		.setParameter('userId', userId)
	// 		.orderBy('lastMessage.updatedAt', 'DESC')
	// 		.skip(skip)
	// 		.take(take)
	// 		.getMany();
	// }
	//
	// // TODO check if needed
	// public async getChatById(chatId: string): Promise<DirectChat | null> {
	// 	const lastMessageSubQuery: string = this._dataSource
	// 		.createQueryBuilder()
	// 		.select('directChatMessage.id')
	// 		.from(DirectChatMessage, 'directChatMessage')
	// 		.where('directChatMessage.directChatId = directChat.id')
	// 		.orderBy('directChatMessage.updatedAt', 'DESC')
	// 		.limit(1)
	// 		.getQuery();
	//
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('directChat')
	// 		.from(DirectChat, 'directChat')
	// 		.leftJoinAndSelect('directChat.users', 'users')
	// 		.leftJoinAndMapMany(
	// 			'directChat.messages',
	// 			DirectChatMessage,
	// 			'lastMessage',
	// 			`lastMessage.id = (${lastMessageSubQuery})`,
	// 		)
	// 		.leftJoinAndSelect('lastMessage.sender', 'sender')
	// 		.where('directChat.id = :id', { id: chatId })
	// 		.getOne();
	// }
	//
	// // TODO check if needed
	// public async getChatByUsers(
	// 	firstUserId: string,
	// 	secondUserId: string,
	// ): Promise<DirectChat | null> {
	// 	const chatWithFirstUserExistCondition: SelectQueryBuilder<ObjectLiteral> = this._dataSource
	// 		.createQueryBuilder()
	// 		.select('*')
	// 		.from('DirectChatUsers', 'directChatUsers')
	// 		.where('directChatUsers.directChatId = directChat.id')
	// 		.andWhere('directChatUsers.userId = :userId', { userId: firstUserId });
	//
	// 	const chatWithSecondUserExistCondition: SelectQueryBuilder<ObjectLiteral> = this._dataSource
	// 		.createQueryBuilder()
	// 		.select('*')
	// 		.from('DirectChatUsers', 'directChatUsers')
	// 		.where('directChatUsers.directChatId = directChat.id')
	// 		.andWhere('directChatUsers.userId = :userId', { userId: secondUserId });
	//
	// 	return await this._dataSource
	// 		.createQueryBuilder()
	// 		.select('directChat')
	// 		.from(DirectChat, 'directChat')
	// 		.whereExists(chatWithFirstUserExistCondition)
	// 		.andWhereExists(chatWithSecondUserExistCondition)
	// 		.getOne();
	// }
}
