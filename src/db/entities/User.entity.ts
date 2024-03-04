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

	@OneToOne(() => AccountSettings, (accountSettings: AccountSettings) => accountSettings.user, {
		nullable: false,
		onDelete: 'NO ACTION',
	})
	@JoinColumn({ name: 'accountSettingsId', referencedColumnName: 'id' })
	accountSettings: AccountSettings;

	@OneToOne(() => JWTToken, (jwtToken: JWTToken) => jwtToken.user, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'jwtTokenId', referencedColumnName: 'id' })
	JWTToken: JWTToken | null;

	@OneToOne(() => OTPCode, (otpCode: OTPCode) => otpCode.user, {
		nullable: true,
		onDelete: 'SET NULL',
	})
	@JoinColumn({ name: 'otpCodeId', referencedColumnName: 'id' })
	OTPCode: OTPCode | null;

	@OneToOne(
		() => PasswordResetToken,
		(passwordResetToken: PasswordResetToken) => passwordResetToken.user,
		{ nullable: true, onDelete: 'SET NULL' },
	)
	@JoinColumn({ name: 'passwordResetTokenId', referencedColumnName: 'id' })
	passwordResetToken: PasswordResetToken | null;

	@ManyToMany(() => DirectChat, (directChat: DirectChat) => directChat.users, {
		onDelete: 'CASCADE',
	})
	directChats: DirectChat[];

	@ManyToMany(() => GroupChat, (groupChat: GroupChat) => groupChat.users, { onDelete: 'CASCADE' })
	groupChats: GroupChat[];

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
	blockedUsers: User[];
}
