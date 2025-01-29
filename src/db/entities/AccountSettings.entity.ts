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
 * Domain entity representing settings for user account
 */
@Entity('AccountSettings')
export class AccountSettings {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

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
	public createdAt: string;

	@Column({ type: 'boolean', default: false })
	public enterIsSend: boolean;

	@Column({ type: 'boolean', default: false })
	public notification: boolean;

	@Column({ type: 'boolean', default: false })
	public twoStepVerification: boolean;

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
	public updatedAt: string;

	@OneToOne(() => User, (user: User) => user.accountSettings, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	public user: User;
}
