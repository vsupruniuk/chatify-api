import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing junction table wo pair users with their direct chats
 */
@Entity('UserDirectChats')
export class UserDirectChats {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	directChatId: string;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	userId: string;
}
