import {
	Column,
	CreateDateColumn,
	Entity,
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

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({
		type: 'datetime',
		nullable: true,
	})
	expiresAt: string | null;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;
}
