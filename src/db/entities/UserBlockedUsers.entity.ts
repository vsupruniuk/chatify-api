import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing junction table wo pair users with their blocked users
 */
@Entity('UserBlockedUsers')
export class UserBlockedUsers {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	blockedUserId: string;

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
