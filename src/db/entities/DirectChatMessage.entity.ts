import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing messages in direct chats
 */
@Entity('DirectChatMessages')
export class DirectChatMessage {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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

	@Column({
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
	dateTime: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	directChatId: string;

	@Column({
		type: 'varchar',
		length: 1000,
		nullable: false,
	})
	messageText: string;

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

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	userId: string;
}
