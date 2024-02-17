import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
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

	@CreateDateColumn({
		type: 'datetime',
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

	@Index({ unique: true })
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

	@Index({ unique: true })
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

	@UpdateDateColumn({
		type: 'datetime',
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
	JWTTokenId: string | null;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	OTPCodeId: string | null;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	passwordResetTokenId: string | null;
}
