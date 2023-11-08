import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '@Entity/User.entity';
import { GroupChatMessage } from '@Entity/GroupChatMessage.entity';

@Entity('GroupChats')
export class GroupChat {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	avatarUrl: string | null;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	chatName: string;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'boolean', default: true })
	isEmpty: boolean;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	// Columns With Relations
	@ManyToMany(() => User, (user: User) => user.groupChats, {
		eager: true,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'userId' })
	users: User[];

	@ManyToMany(() => GroupChatMessage, (message: GroupChatMessage) => message.groupChat, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'messageId' })
	messages: GroupChatMessage[];
}
