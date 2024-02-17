import { MigrationInterface, QueryRunner } from "typeorm";

export class PasswordResetToken1707581834246 implements MigrationInterface {
    name = 'PasswordResetToken1707581834246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` CHANGE \`passwordResetToken\` \`passwordResetTokenId\` varchar(255) NULL`);
        await queryRunner.query(`CREATE TABLE \`PasswordResetTokens\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expiresAt\` datetime NULL, \`token\` varchar(255) NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`DirectChatMessages\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`GroupChats\` DROP COLUMN \`isEmpty\``);
        await queryRunner.query(`ALTER TABLE \`GroupChatMessages\` DROP COLUMN \`userId\``);
        await queryRunner.query(`ALTER TABLE \`DirectChats\` DROP COLUMN \`isEmpty\``);
        await queryRunner.query(`ALTER TABLE \`DirectChatMessages\` ADD \`senderId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`GroupChatMessages\` ADD \`senderId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`DirectChatMessages\` ADD UNIQUE INDEX \`IDX_508f05ad230e14a4a3dc8cd791\` (\`directChatId\`)`);
        await queryRunner.query(`ALTER TABLE \`GroupChatMessages\` ADD UNIQUE INDEX \`IDX_ac37556d6870ec3356f26c60c8\` (\`groupChatId\`)`);
        await queryRunner.query(`ALTER TABLE \`Users\` DROP COLUMN \`passwordResetTokenId\``);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD \`passwordResetTokenId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`UserBlockedUsers\` ADD UNIQUE INDEX \`IDX_9f7767efbb64840e52686a6b10\` (\`blockedUserId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserBlockedUsers\` ADD UNIQUE INDEX \`IDX_92c5adef1aa29dea7243b439d5\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserConnectedUsers\` ADD UNIQUE INDEX \`IDX_3b2927863a1140ee400f3fcd22\` (\`connectedUserId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserConnectedUsers\` ADD UNIQUE INDEX \`IDX_b0c20d4e6dffc62d7ab52c8cce\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserDirectChats\` ADD UNIQUE INDEX \`IDX_a2ed6f31a0c24122c916a09fe8\` (\`directChatId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserDirectChats\` ADD UNIQUE INDEX \`IDX_8920f825c89f1ab9579ebdaf40\` (\`userId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserGroupChats\` ADD UNIQUE INDEX \`IDX_7d63f4fcae303a169d6727dff3\` (\`groupChatId\`)`);
        await queryRunner.query(`ALTER TABLE \`UserGroupChats\` ADD UNIQUE INDEX \`IDX_4ea0ad9480b484e5a84fa50ed7\` (\`userId\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`UserGroupChats\` DROP INDEX \`IDX_4ea0ad9480b484e5a84fa50ed7\``);
        await queryRunner.query(`ALTER TABLE \`UserGroupChats\` DROP INDEX \`IDX_7d63f4fcae303a169d6727dff3\``);
        await queryRunner.query(`ALTER TABLE \`UserDirectChats\` DROP INDEX \`IDX_8920f825c89f1ab9579ebdaf40\``);
        await queryRunner.query(`ALTER TABLE \`UserDirectChats\` DROP INDEX \`IDX_a2ed6f31a0c24122c916a09fe8\``);
        await queryRunner.query(`ALTER TABLE \`UserConnectedUsers\` DROP INDEX \`IDX_b0c20d4e6dffc62d7ab52c8cce\``);
        await queryRunner.query(`ALTER TABLE \`UserConnectedUsers\` DROP INDEX \`IDX_3b2927863a1140ee400f3fcd22\``);
        await queryRunner.query(`ALTER TABLE \`UserBlockedUsers\` DROP INDEX \`IDX_92c5adef1aa29dea7243b439d5\``);
        await queryRunner.query(`ALTER TABLE \`UserBlockedUsers\` DROP INDEX \`IDX_9f7767efbb64840e52686a6b10\``);
        await queryRunner.query(`ALTER TABLE \`Users\` DROP COLUMN \`passwordResetTokenId\``);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD \`passwordResetTokenId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`GroupChatMessages\` DROP INDEX \`IDX_ac37556d6870ec3356f26c60c8\``);
        await queryRunner.query(`ALTER TABLE \`DirectChatMessages\` DROP INDEX \`IDX_508f05ad230e14a4a3dc8cd791\``);
        await queryRunner.query(`ALTER TABLE \`GroupChatMessages\` DROP COLUMN \`senderId\``);
        await queryRunner.query(`ALTER TABLE \`DirectChatMessages\` DROP COLUMN \`senderId\``);
        await queryRunner.query(`ALTER TABLE \`DirectChats\` ADD \`isEmpty\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`GroupChatMessages\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`GroupChats\` ADD \`isEmpty\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`DirectChatMessages\` ADD \`userId\` varchar(255) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`PasswordResetTokens\``);
        await queryRunner.query(`ALTER TABLE \`Users\` CHANGE \`passwordResetTokenId\` \`passwordResetToken\` varchar(255) NULL`);
    }

}
