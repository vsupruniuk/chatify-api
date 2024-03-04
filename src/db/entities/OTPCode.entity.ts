import { User } from '@Entities/User.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing information about OTP code
 */
@Entity('OTPCodes')
export class OTPCode {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'int', nullable: true })
	code: number | null;

	@CreateDateColumn({
		type: 'timestamp',
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
		type: 'timestamp',
		nullable: true,
		transformer: {
			from(date: string): string {
				return new Date(date).toISOString();
			},
			to(date: string): string {
				return date;
			},
		},
	})
	expiresAt: string | null;

	@UpdateDateColumn({
		type: 'timestamp',
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

	@OneToOne(() => User, (user: User) => user.OTPCode, { nullable: false, onDelete: 'CASCADE' })
	user: User;
}
