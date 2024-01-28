import {
	Column,
	CreateDateColumn,
	Entity,
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

	@CreateDateColumn({ type: 'datetime', nullable: false })
	createdAt: string;

	@Column({
		type: 'varchar',
		length: 500,
		unique: true,
		nullable: false,
	})
	token: string;

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;
}