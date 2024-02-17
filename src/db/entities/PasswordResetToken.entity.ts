import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('PasswordResetTokens')
export class PasswordResetToken {
	@PrimaryGeneratedColumn('uuid')
	id: string;

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

	@Column({
		type: 'datetime',
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
}
