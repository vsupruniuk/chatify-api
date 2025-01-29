import { AccountSettings } from '@Entities/AccountSettings.entity';
import { DirectChat } from '@Entities/DirectChat.entity';
import { GroupChat } from '@Entities/GroupChat.entity';
import { JWTToken } from '@Entities/JWTToken.entity';
import { OTPCode } from '@Entities/OTPCode.entity';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
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
@Entity('Users')
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
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	public avatarUrl: string | null;

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

	@Index({ unique: true })
	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	public email: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	public firstName: string;

	@Column({ type: 'boolean', default: false })
	public isActivated: boolean;

	@Column({
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

	@OneToOne(() => AccountSettings, (accountSettings: AccountSettings) => accountSettings.user, {
		nullable: false,
		onDelete: 'NO ACTION',
	})
	@JoinColumn({ name: 'accountSettingsId', referencedColumnName: 'id' })
	public accountSettings: AccountSettings;

	@OneToOne(() => JWTToken, (jwtToken: JWTToken) => jwtToken.user, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'jwtTokenId', referencedColumnName: 'id' })
	public JWTToken: JWTToken | null;

	@OneToOne(() => OTPCode, (otpCode: OTPCode) => otpCode.user, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'otpCodeId', referencedColumnName: 'id' })
	public OTPCode: OTPCode | null;

	@OneToOne(
		() => PasswordResetToken,
		(passwordResetToken: PasswordResetToken) => passwordResetToken.user,
		{ nullable: true, onDelete: 'SET NULL' },
	)
	@JoinColumn({ name: 'passwordResetTokenId', referencedColumnName: 'id' })
	public passwordResetToken: PasswordResetToken | null;

	@ManyToMany(() => DirectChat, (directChat: DirectChat) => directChat.users, {
		onDelete: 'CASCADE',
	})
	public directChats: DirectChat[];

	@ManyToMany(() => GroupChat, (groupChat: GroupChat) => groupChat.users, { onDelete: 'CASCADE' })
	public groupChats: GroupChat[];

	@ManyToMany(() => User, (user: User) => user.blockedUsers, { onDelete: 'NO ACTION' })
	@JoinTable({
		name: 'UserBlockedUsers',
		joinColumn: {
			name: 'userId',
			referencedColumnName: 'id',
		},
		inverseJoinColumn: {
			name: 'blockedUserId',
			referencedColumnName: 'id',
		},
	})
	public blockedUsers: User[];
}
