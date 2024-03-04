import { DirectChatMessage } from '@Entities/DirectChatMessage.entity';
import { User } from '@Entities/User.entity';
import {
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing direct chat between 2 users
 */
@Entity('DirectChats')
export class DirectChat {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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
		() => DirectChatMessage,
		(directChatMessage: DirectChatMessage) => directChatMessage.directChat,
		{ nullable: false, onDelete: 'NO ACTION' },
	)
	messages: DirectChatMessage[];

	@ManyToMany(() => User, (user: User) => user.directChats, {
		nullable: false,
		onDelete: 'NO ACTION',
	})
	@JoinTable({
		name: 'DirectChatUsers',
		joinColumn: {
			name: 'directChatId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'userId',
			referencedColumnName: 'id',
		},
	})
	users: User[];
}
