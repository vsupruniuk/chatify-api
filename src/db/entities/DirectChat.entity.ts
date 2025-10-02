import {
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { DirectChatMessage, User } from '@entities';

/**
 * Domain entity representing direct chat between 2 users
 */
@Entity('direct_chats')
export class DirectChat {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		nullable: false,
	})
	public createdAt: string;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@OneToMany(
		() => DirectChatMessage,
		(directChatMessage: DirectChatMessage) => directChatMessage.directChat,
		{ nullable: false, onDelete: 'NO ACTION' },
	)
	public messages: DirectChatMessage[];

	@ManyToMany(() => User, (user: User) => user.directChats, {
		nullable: false,
		onDelete: 'NO ACTION',
	})
	@JoinTable({
		name: 'direct_chats_users',
		joinColumn: {
			name: 'direct_chat_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'user_id',
			referencedColumnName: 'id',
		},
	})
	public users: User[];
}
