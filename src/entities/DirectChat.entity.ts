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
import { DirectChatMessage } from '@Entity/DirectChatMessage.entity';

@Entity('DirectChats')
export class DirectChat {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'boolean', default: true })
	isEmpty: boolean;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	// Columns With Relations
	@ManyToMany(() => User, (user: User) => user.directChats, {
		eager: true,
		cascade: false,
	})
	@JoinColumn({ name: 'userId' })
	users: User[];

	@ManyToMany(() => DirectChatMessage, (message: DirectChatMessage) => message.directChat, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'messageId' })
	messages: DirectChatMessage[];
}
