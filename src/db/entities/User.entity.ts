import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing user
 */
@Entity('Users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	about: string | null;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	avatarUrl: string | null;

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	email: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	firstName: string;

	@Column({ type: 'boolean', default: false })
	isActivated: boolean;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	lastName: string | null;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	nickname: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	password: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	passwordResetToken: string | null;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	accountSettingsId: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	OTPCodeId: string | null;
}
