import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '@Entity/User.entity';

@Entity('Messages')
export abstract class BaseMessage {
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
		length: 1000,
		nullable: false,
	})
	messageText: string;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	// Columns With Relations
	@ManyToOne(() => User, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'userId' })
	user: User;
}
