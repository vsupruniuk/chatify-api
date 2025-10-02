import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

import { User } from '@entities';

@Entity('password_reset_tokens')
export class PasswordResetToken {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@CreateDateColumn({
		name: 'created_at',
		nullable: false,
	})
	public createdAt: string;

	@Column({
		type: 'timestamp',
		name: 'expires_at',
		nullable: true,
	})
	public expiresAt: string | null;

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
		unique: true,
	})
	public token: string | null;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@OneToOne(() => User, (user: User) => user.passwordResetToken, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	public user: User;
}
