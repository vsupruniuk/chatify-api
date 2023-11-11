import {
	Column,
	CreateDateColumn,
	Entity,
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

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'boolean', default: true })
	isEmpty: boolean;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;
}
