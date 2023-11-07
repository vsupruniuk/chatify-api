import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('AccountSettings')
export class AccountSettings {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
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
