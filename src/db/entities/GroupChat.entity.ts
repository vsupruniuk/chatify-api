import { GroupChatMessage } from '@Entities/GroupChatMessage.entity';
import { User } from '@Entities/User.entity';
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

/**
 * Domain entity representing group chat between mane users
 */
@Entity('GroupChats')
export class GroupChat {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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
	name: string;

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
	createdAt: string;

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
	updatedAt: string;

	@OneToMany(
		() => GroupChatMessage,
		(groupChatMessage: GroupChatMessage) => groupChatMessage.groupChat,
		{ nullable: false, onDelete: 'NO ACTION' },
	)
	messages: GroupChatMessage[];

	@ManyToMany(() => User, (user: User) => user.groupChats, { onDelete: 'NO ACTION' })
	@JoinTable({
		name: 'GroupChatUsers',
		joinColumn: {
			name: 'groupChatId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'userId',
			referencedColumnName: 'id',
		},
	})
	users: User[];
}
