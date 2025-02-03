import { GroupChat } from '@Entities/GroupChat.entity';
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
 * Domain entity representing messages in group chats
 */
@Entity('GroupChatMessages')
export class GroupChatMessage {
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

	@ManyToOne(() => GroupChat, (groupChat: GroupChat) => groupChat.messages, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'groupChatId', referencedColumnName: 'id' })
	public groupChat: GroupChat;

	@ManyToOne(() => User, { nullable: false, onDelete: 'NO ACTION' })
	@JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
	public sender: User;
}
