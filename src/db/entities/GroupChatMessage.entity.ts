import { Column, Entity } from 'typeorm';
import { BaseMessage } from './BaseMessage.entity';

@Entity('GroupChatMessages')
export class GroupChatMessage extends BaseMessage {
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	groupChatId: string;
}
