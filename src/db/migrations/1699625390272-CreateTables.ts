import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

import { DBTables } from '@Enums/db/DBTables.enum';
import { DBTypes } from '@Enums//db/DBTypes.enum';

/**
 * Migration for creating/reverting all necessary tables
 */
export class CreateTables1699625390272 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: DBTables.USERS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'about',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: true,
					},
					{
						name: 'avatarUrl',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: true,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'email',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
						isUnique: true,
					},
					{
						name: 'firstName',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'isActivated',
						type: DBTypes.BOOLEAN,
						default: false,
					},
					{
						name: 'lastName',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: true,
					},
					{
						name: 'nickname',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
						isUnique: true,
					},
					{
						name: 'password',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'accountSettingsId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'OTPCodeId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: true,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.USER_BLOCKED_USERS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'blockedUserId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'userId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.USER_CONNECTED_USERS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'connectedUserId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'userId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.USER_DIRECT_CHATS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'directChatId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'userId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.USER_GROUP_CHATS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'groupChatId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'userId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.ACCOUNT_SETTINGS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'enterIsSend',
						type: DBTypes.BOOLEAN,
						default: false,
					},
					{
						name: 'notification',
						type: DBTypes.BOOLEAN,
						default: false,
					},
					{
						name: 'twoStepVerification',
						type: DBTypes.BOOLEAN,
						default: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.DIRECT_CHAT_MESSAGES,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'dateTime',
						type: DBTypes.DATETIME,
						isNullable: false,
					},
					{
						name: 'messageText',
						type: DBTypes.VARCHAR,
						length: '1000',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'userId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'directChatId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.GROUP_CHAT_MESSAGES,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'dateTime',
						type: DBTypes.DATETIME,
						isNullable: false,
					},
					{
						name: 'messageText',
						type: DBTypes.VARCHAR,
						length: '1000',
						isNullable: false,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'userId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'groupChatId',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.DIRECT_CHATS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'isEmpty',
						type: DBTypes.BOOLEAN,
						default: true,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.GROUP_CHATS,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'avatarUrl',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: true,
					},
					{
						name: 'chatName',
						type: DBTypes.VARCHAR,
						length: '255',
						isNullable: false,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'isEmpty',
						type: DBTypes.BOOLEAN,
						default: true,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: DBTables.OTP_CODES,
				columns: [
					{
						name: 'id',
						type: DBTypes.VARCHAR,
						generationStrategy: 'uuid',
						isPrimary: true,
					},
					{
						name: 'code',
						type: DBTypes.INT,
						isNullable: true,
					},
					{
						name: 'createdAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
					{
						name: 'expiresAt',
						type: DBTypes.DATETIME,
						isNullable: true,
					},
					{
						name: 'updatedAt',
						type: DBTypes.DATETIME,
						default: 'now()',
						isNullable: false,
					},
				],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USERS,
			new TableIndex({
				name: 'IDX_USERS_EMAIL',
				columnNames: ['email'],
				isUnique: true,
			}),
		);

		await queryRunner.createIndex(
			DBTables.USERS,
			new TableIndex({
				name: 'IDX_USERS_NICKNAME',
				columnNames: ['nickname'],
				isUnique: true,
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_BLOCKED_USERS,
			new TableIndex({
				name: 'IDX_USER_BLOCKED_USERS_BLOCKEDUSERID',
				columnNames: ['blockedUserId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_BLOCKED_USERS,
			new TableIndex({
				name: 'IDX_USER_BLOCKED_USERS_USERID',
				columnNames: ['userId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_CONNECTED_USERS,
			new TableIndex({
				name: 'IDX_USER_CONNECTED_USERS_CONNECTEDUSERID',
				columnNames: ['connectedUserId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_CONNECTED_USERS,
			new TableIndex({
				name: 'IDX_USER_CONNECTED_USERS_USERID',
				columnNames: ['userId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_DIRECT_CHATS,
			new TableIndex({
				name: 'IDX_USER_DIRECT_CHATS_DIRECTCHATID',
				columnNames: ['directChatId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_DIRECT_CHATS,
			new TableIndex({
				name: 'IDX_USER_DIRECT_CHATS_USERID',
				columnNames: ['userId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_GROUP_CHATS,
			new TableIndex({
				name: 'IDX_USER_GROUP_CHATS_GROUPCHATID',
				columnNames: ['groupChatId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.USER_GROUP_CHATS,
			new TableIndex({
				name: 'IDX_USER_GROUP_CHATS_USERID',
				columnNames: ['userId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.DIRECT_CHAT_MESSAGES,
			new TableIndex({
				name: 'IDX_DIRECT_CHAT_MESSAGES_DIRECTCHATID',
				columnNames: ['directChatId'],
			}),
		);

		await queryRunner.createIndex(
			DBTables.GROUP_CHAT_MESSAGES,
			new TableIndex({
				name: 'IDX_DIRECT_CHAT_MESSAGES_GROUPCHATID',
				columnNames: ['groupChatId'],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable(DBTables.USERS, true, true, true);
		await queryRunner.dropTable(DBTables.USER_BLOCKED_USERS, true, true, true);
		await queryRunner.dropTable(DBTables.USER_CONNECTED_USERS, true, true, true);
		await queryRunner.dropTable(DBTables.USER_DIRECT_CHATS, true, true, true);
		await queryRunner.dropTable(DBTables.USER_GROUP_CHATS, true, true, true);
		await queryRunner.dropTable(DBTables.ACCOUNT_SETTINGS, true, true, true);
		await queryRunner.dropTable(DBTables.DIRECT_CHAT_MESSAGES, true, true, true);
		await queryRunner.dropTable(DBTables.GROUP_CHAT_MESSAGES, true, true, true);
		await queryRunner.dropTable(DBTables.DIRECT_CHATS, true, true, true);
		await queryRunner.dropTable(DBTables.GROUP_CHATS, true, true, true);
		await queryRunner.dropTable(DBTables.OTP_CODES, true, true, true);

		await queryRunner.dropIndex(DBTables.USERS, 'IDX_USERS_EMAIL');
		await queryRunner.dropIndex(DBTables.USERS, 'IDX_USERS_NICKNAME');
		await queryRunner.dropIndex(
			DBTables.USER_BLOCKED_USERS,
			'IDX_USER_BLOCKED_USERS_BLOCKEDUSERID',
		);
		await queryRunner.dropIndex(DBTables.USER_BLOCKED_USERS, 'IDX_USER_BLOCKED_USERS_USERID');
		await queryRunner.dropIndex(
			DBTables.USER_CONNECTED_USERS,
			'IDX_USER_CONNECTED_USERS_CONNECTEDUSERID',
		);
		await queryRunner.dropIndex(DBTables.USER_CONNECTED_USERS, 'IDX_USER_CONNECTED_USERS_USERID');
		await queryRunner.dropIndex(DBTables.USER_DIRECT_CHATS, 'IDX_USER_DIRECT_CHATS_DIRECTCHATID');
		await queryRunner.dropIndex(DBTables.USER_DIRECT_CHATS, 'IDX_USER_DIRECT_CHATS_USERID');
		await queryRunner.dropIndex(DBTables.USER_GROUP_CHATS, 'IDX_USER_GROUP_CHATS_GROUPCHATID');
		await queryRunner.dropIndex(DBTables.USER_GROUP_CHATS, 'IDX_USER_GROUP_CHATS_USERID');
		await queryRunner.dropIndex(
			DBTables.DIRECT_CHAT_MESSAGES,
			'IDX_DIRECT_CHAT_MESSAGES_DIRECTCHATID',
		);
		await queryRunner.dropIndex(
			DBTables.GROUP_CHAT_MESSAGES,
			'IDX_DIRECT_CHAT_MESSAGES_GROUPCHATID',
		);
	}
}
