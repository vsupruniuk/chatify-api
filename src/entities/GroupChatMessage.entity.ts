import { Entity, JoinColumn, ManyToMany } from 'typeorm';
import { GroupChat } from '@Entity/GroupChat.entity';
import { BaseMessage } from '@Entity/BaseMessage.entity';

@Entity('Messages')
export class GroupChatMessage extends BaseMessage {
	@ManyToMany(() => GroupChat, (groupChat: GroupChat) => groupChat.messages, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'groupChatId' })
	groupChat: GroupChat;
}
