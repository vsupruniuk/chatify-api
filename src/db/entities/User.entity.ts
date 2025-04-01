import { AccountSettings } from '@entities/AccountSettings.entity';
import { DirectChat } from '@entities/DirectChat.entity';
import { GroupChat } from '@entities/GroupChat.entity';
import { JWTToken } from '@entities/JWTToken.entity';
import { OTPCode } from '@entities/OTPCode.entity';
import { PasswordResetToken } from '@entities/PasswordResetToken.entity';
import {
	Column,
	CreateDateColumn,
	Entity,
	Index,
	JoinColumn,
	JoinTable,
	ManyToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

/**
 * Domain entity representing user
 */
@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	public id: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	public about: string | null;

	@Column({
		name: 'avatar_url',
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	public avatarUrl: string | null;

	@CreateDateColumn({
		name: 'created_at',
		type: 'timestamp',
		nullable: false,
	})
	public createdAt: string;

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	public email: string;

	@Column({
		name: 'first_name',
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	public firstName: string;

	@Column({ name: 'is_activated', type: 'boolean', default: false })
	public isActivated: boolean;

	@Column({
		name: 'last_name',
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	public lastName: string | null;

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	public nickname: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	public password: string;

	@UpdateDateColumn({
		name: 'updated_at',
		type: 'timestamp',
		nullable: false,
	})
	public updatedAt: string;

	@OneToOne(() => AccountSettings, (accountSettings: AccountSettings) => accountSettings.user, {
		nullable: false,
		onDelete: 'NO ACTION',
	})
	@JoinColumn({ name: 'account_settings_id', referencedColumnName: 'id' })
	public accountSettings: AccountSettings;

	@OneToOne(() => JWTToken, (jwtToken: JWTToken) => jwtToken.user, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'jwt_token_id', referencedColumnName: 'id' })
	public jwtToken: JWTToken | null;

	@OneToOne(() => OTPCode, (otpCode: OTPCode) => otpCode.user, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'otp_code_id', referencedColumnName: 'id' })
	public otpCode: OTPCode | null;

	@OneToOne(
		() => PasswordResetToken,
		(passwordResetToken: PasswordResetToken) => passwordResetToken.user,
		{ nullable: true, onDelete: 'SET NULL' },
	)
	@JoinColumn({ name: 'password_reset_token_id', referencedColumnName: 'id' })
	public passwordResetToken: PasswordResetToken | null;

	@ManyToMany(() => DirectChat, (directChat: DirectChat) => directChat.users, {
		onDelete: 'CASCADE',
	})
	public directChats: DirectChat[];

	@ManyToMany(() => GroupChat, (groupChat: GroupChat) => groupChat.users, { onDelete: 'CASCADE' })
	public groupChats: GroupChat[];

	@ManyToMany(() => User, (user: User) => user.blockedUsers, { onDelete: 'NO ACTION' })
	@JoinTable({
		name: 'user_blocked_users',
		joinColumn: {
			name: 'user_id',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'blocked_user_id',
			referencedColumnName: 'id',
		},
	})
	public blockedUsers: User[];
}
