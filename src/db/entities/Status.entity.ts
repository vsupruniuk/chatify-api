import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing user status
 */
@Entity('Statuses')
export class Status {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'datetime', nullable: false })
	dateTime: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	statusText: string;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;
}
