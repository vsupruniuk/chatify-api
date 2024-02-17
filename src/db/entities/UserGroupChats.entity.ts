import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing junction table wo pair users with their group chats
 */
@Entity('UserGroupChats')
export class UserGroupChats {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	groupChatId: string;

	@CreateDateColumn({
		type: 'datetime',
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
		type: 'datetime',
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

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	userId: string;
}
