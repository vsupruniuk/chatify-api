import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { AccountSettings } from '@Entity/AccountSettings.entity';
import { DirectChat } from '@Entity/DirectChat.entity';
import { GroupChat } from '@Entity/GroupChat.entity';
import { OTPCode } from '@Entity/OTPCode.entity';
import { Status } from '@Entity/Status.entity';

@Entity('Users')
export class User {
	// Primary Column
	@PrimaryGeneratedColumn('uuid')
	id: string;

	// Columns
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

	@UpdateDateColumn({ type: 'datetime', nullable: false })
	updatedAt: string;

	// Columns With Relations
	@OneToOne(() => AccountSettings, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'accountSettingsId' })
	accountSettings: AccountSettings;

	@ManyToMany(() => User, (user: User) => user.blockedUsers, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'blockedUserId' })
	blockedUsers: User[];

	@ManyToMany(() => User, (user: User) => user.connectedUsers, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	@JoinColumn({ name: 'connectedUserId' })
	connectedUsers: User[];

	@ManyToMany(() => DirectChat, (directChat: DirectChat) => directChat.users, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	directChats: DirectChat[];

	@ManyToMany(() => GroupChat, (groupChat: GroupChat) => groupChat.users, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	groupChats: GroupChat[];

	@OneToOne(() => OTPCode, (OTPCode: OTPCode) => OTPCode.user, {
		eager: false,
		cascade: false,
		nullable: true,
	})
	@JoinColumn({ name: 'OTPCodeId' })
	OTPCode: OTPCode | null;

	@OneToOne(() => Status, (status: Status) => status.user, {
		eager: false,
		cascade: false,
		nullable: false,
	})
	status: Status;
}
