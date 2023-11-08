import { Entity, JoinColumn, ManyToMany } from 'typeorm';
import { DirectChat } from '@Entity/DirectChat.entity';
import { BaseMessage } from '@Entity/BaseMessage.entity';

@Entity('Messages')
export class DirectChatMessage extends BaseMessage {
	@ManyToMany(() => DirectChat, (directChat: DirectChat) => directChat.messages, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'directChatId' })
	directChat: DirectChat;
}
