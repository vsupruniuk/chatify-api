import { DirectChat } from '@entities/DirectChat.entity';
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
 * Domain entity representing messages in direct chats
 */
@Entity('direct_chat_messages')
export class DirectChatMessage {
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
		name: 'message_text',
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

	@ManyToOne(() => DirectChat, (directChat: DirectChat) => directChat.messages, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'direct_chat_id', referencedColumnName: 'id' })
	public directChat: DirectChat;

	@ManyToOne(() => User, { nullable: false, onDelete: 'NO ACTION' })
	@JoinColumn({ name: 'sender_id', referencedColumnName: 'id' })
	public sender: User;
}
