import { Column, Entity } from 'typeorm';
import { BaseMessage } from './BaseMessage.entity';

@Entity('DirectChatMessages')
export class DirectChatMessage extends BaseMessage {
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	directChatId: string;
}
