import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { User } from '@Entity/User.entity';

@Entity('OTPCodes')
export class OTPCode {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
	@Column({ type: 'int', nullable: true })
	code: number | null;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({
		type: 'datetime',
		nullable: true,
	})
	expiresAt: string | null;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	@OneToOne(() => User, (user: User) => user.OTPCode)
	@JoinColumn({ name: 'userId' })
	user: User;
}
