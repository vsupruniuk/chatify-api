import { GroupChat } from '@entities/GroupChat.entity';
import { User } from '@entities/User.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing messages in group chats
 */
@Entity('group_chat_messages')
export class GroupChatMessage {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		nullable: false,
	})
	public createdAt: string;

	@CreateDateColumn({
		name: 'date_time',
		type: 'timestamp',
		nullable: false,
	})
	public dateTime: string;

	@Column({
		type: 'varchar',
		length: 1000,
		nullable: false,
	})
	public messageText: string;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@ManyToOne(() => GroupChat, (groupChat: GroupChat) => groupChat.messages, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'group_chat_id', referencedColumnName: 'id' })
	public groupChat: GroupChat;

	@ManyToOne(() => User, { nullable: false, onDelete: 'NO ACTION' })
	@JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
	public sender: User;
}
