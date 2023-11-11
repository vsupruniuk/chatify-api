import {
	Column,
	CreateDateColumn,
	Entity,
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
	chatName: string;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'boolean', default: true })
	isEmpty: boolean;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;
}
