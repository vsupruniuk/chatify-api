import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('Statuses')
export class Status {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
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

	// Columns With Relations
	@OneToOne(() => User, (user: User) => user.status, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'userId' })
	user: User;
}
