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

/**
 * Domain model representing user JWT token
 */
@Entity('jwt_tokens')
export class JWTToken {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		nullable: false,
	})
	public createdAt: string;

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 500,
		unique: true,
		nullable: true,
	})
	public token: string | null;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@OneToOne(() => User, (user: User) => user.jwtToken, { nullable: false, onDelete: 'CASCADE' })
	public user: User;
}
