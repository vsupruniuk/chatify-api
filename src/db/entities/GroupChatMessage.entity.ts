import { Column, Entity } from 'typeorm';

import { BaseMessage } from './BaseMessage.entity';

/**
 * Domain entity representing messages in group chats
 */
@Entity('GroupChatMessages')
export class GroupChatMessage extends BaseMessage {
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	groupChatId: string;
}
