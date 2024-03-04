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

/**
 * Domain model representing user JWT token
 */
@Entity('JWTToken')
export class JWTToken {
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

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 500,
		unique: true,
		nullable: false,
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

	@OneToOne(() => User, (user: User) => user.JWTToken, { nullable: false, onDelete: 'CASCADE' })
	user: User;
}
