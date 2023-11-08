import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '@Entity/User.entity';
import { DirectChat } from '@Entity/DirectChat.entity';
import { GroupChat } from '@Entity/GroupChat.entity';

@Entity('Messages')
export class Message {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'datetime', nullable: false })
	dateTime: string;

	@Column({
		type: 'varchar',
		length: 1000,
		nullable: false,
	})
	messageText: string;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	// Columns With Relations
	@ManyToOne(() => User, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToMany(() => DirectChat, (directChat: DirectChat) => directChat.messages, {
		eager: false,
		cascade: false,
		nullable: true,
	})
	@JoinColumn({ name: 'directChatId' })
	directChat: DirectChat | null;

	@ManyToMany(() => GroupChat, (groupChat: GroupChat) => groupChat.messages, {
		eager: false,
		cascade: false,
		nullable: true,
	})
	@JoinColumn({ name: 'groupChatId' })
	groupChat: GroupChat | null;
}
