import { User } from '@Entities/User.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('PasswordResetTokens')
export class PasswordResetToken {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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

	@Index()
	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	token: string;

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

	@OneToOne(() => User, (user: User) => user.passwordResetToken, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	user: User;
}
