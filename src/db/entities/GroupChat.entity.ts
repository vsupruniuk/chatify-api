import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { GroupChatMessage, User } from '@entities';

/**
 * Domain entity representing group chat between mane users
 */
@Entity('group_chats')
export class GroupChat {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@Column({
		name: 'avatar_url',
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	public avatarUrl: string | null;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	public name: string;

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
		() => GroupChatMessage,
		(groupChatMessage: GroupChatMessage) => groupChatMessage.groupChat,
		{ nullable: false, onDelete: 'NO ACTION' },
	)
	public messages: GroupChatMessage[];

	@ManyToMany(() => User, (user: User) => user.groupChats, { onDelete: 'NO ACTION' })
	@JoinTable({
		name: 'group_chats_users',
		joinColumn: {
			name: 'group_chat_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'user_id',
			referencedColumnName: 'id',
		},
	})
	public users: User[];
}
