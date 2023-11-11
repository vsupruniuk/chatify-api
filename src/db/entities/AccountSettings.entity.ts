import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing settings for user account
 */
@Entity('AccountSettings')
export class AccountSettings {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({ type: 'boolean', default: false })
	enterIsSend: boolean;

	@Column({ type: 'boolean', default: false })
	notification: boolean;

	@Column({ type: 'boolean', default: false })
	twoStepVerification: boolean;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;
}
