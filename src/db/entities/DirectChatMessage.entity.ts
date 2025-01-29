import { DirectChat } from '@Entities/DirectChat.entity';
import { User } from '@Entities/User.entity';
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
@Entity('DirectChatMessages')
export class DirectChatMessage {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@CreateDateColumn({
		type: 'timestamp',
		nullable: false,
		transformer: {
			from(date: string): string {
				return new Date(date).toISOString();
			},
			to(date: string): string {
				return date;
			},
		},
	})
	public createdAt: string;

	@Column({
		type: 'timestamp',
		nullable: false,
		transformer: {
			from(date: string): string {
				return new Date(date).toISOString();
			},
			to(date: string): string {
				return date;
			},
		},
	})
	public dateTime: string;

	@Column({
		type: 'varchar',
		length: 1000,
		nullable: false,
	})
	public messageText: string;

	@UpdateDateColumn({
		type: 'timestamp',
		nullable: false,
		transformer: {
			from(date: string): string {
				return new Date(date).toISOString();
			},
			to(date: string): string {
				return date;
			},
		},
	})
	public updatedAt: string;

	@ManyToOne(() => DirectChat, (directChat: DirectChat) => directChat.messages, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'directChatId', referencedColumnName: 'id' })
	public directChat: DirectChat;

	@ManyToOne(() => User, { nullable: false, onDelete: 'NO ACTION' })
	@JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
	public sender: User;
}
