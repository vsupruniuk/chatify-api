import { User } from '@entities/User.entity';
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
@Entity('otp_codes')
export class OTPCode {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@Column({ type: 'int', nullable: true })
	public code: number | null;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		nullable: false,
	})
	public createdAt: string;

	@Column({
		name: 'expires_at',
		type: 'timestamp',
		nullable: true,
	})
	public expiresAt: string | null;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@OneToOne(() => User, (user: User) => user.otpCode, { nullable: false, onDelete: 'CASCADE' })
	public user: User;
}
