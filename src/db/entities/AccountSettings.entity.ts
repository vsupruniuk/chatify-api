import {
	Column,
	CreateDateColumn,
	Entity,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { User } from '@entities';

/**
 * Domain entity representing settings for user account
 */
@Entity('account_settings')
export class AccountSettings {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		nullable: false,
	})
	public createdAt: string;

	@Column({ name: 'enter_is_sending', type: 'boolean', default: false })
	public enterIsSending: boolean;

	@Column({ type: 'boolean', default: false })
	public notification: boolean;

	@Column({ name: 'two_step_verification', type: 'boolean', default: false })
	public twoStepVerification: boolean;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@OneToOne(() => User, (user: User) => user.accountSettings, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	public user: User;
}
