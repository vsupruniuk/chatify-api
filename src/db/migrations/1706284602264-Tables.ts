import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1706284602264 implements MigrationInterface {
    name = 'Tables1706284602264'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`AccountSettings\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`enterIsSend\` tinyint NOT NULL DEFAULT 0, \`notification\` tinyint NOT NULL DEFAULT 0, \`twoStepVerification\` tinyint NOT NULL DEFAULT 0, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`DirectChats\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isEmpty\` tinyint NOT NULL DEFAULT 1, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`GroupChatMessages\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`dateTime\` datetime NOT NULL, \`groupChatId\` varchar(255) NOT NULL, \`messageText\` varchar(1000) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`GroupChats\` (\`id\` varchar(36) NOT NULL, \`avatarUrl\` varchar(255) NULL, \`chatName\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`isEmpty\` tinyint NOT NULL DEFAULT 1, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Users\` (\`id\` varchar(36) NOT NULL, \`about\` varchar(255) NULL, \`avatarUrl\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`email\` varchar(255) NOT NULL, \`firstName\` varchar(255) NOT NULL, \`isActivated\` tinyint NOT NULL DEFAULT 0, \`lastName\` varchar(255) NULL, \`nickname\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`passwordResetToken\` varchar(255) NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accountSettingsId\` varchar(255) NOT NULL, \`OTPCodeId\` varchar(255) NULL, UNIQUE INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` (\`email\`), UNIQUE INDEX \`IDX_5da3f86a40ce07289424c734c9\` (\`nickname\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`UserBlockedUsers\` (\`id\` varchar(36) NOT NULL, \`blockedUserId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`UserConnectedUsers\` (\`id\` varchar(36) NOT NULL, \`connectedUserId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`UserGroupChats\` (\`id\` varchar(36) NOT NULL, \`groupChatId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`UserDirectChats\` (\`id\` varchar(36) NOT NULL, \`directChatId\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`OTPCodes\` (\`id\` varchar(36) NOT NULL, \`code\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expiresAt\` datetime NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`DirectChatMessages\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`dateTime\` datetime NOT NULL, \`directChatId\` varchar(255) NOT NULL, \`messageText\` varchar(1000) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`DirectChatMessages\``);
        await queryRunner.query(`DROP TABLE \`OTPCodes\``);
        await queryRunner.query(`DROP TABLE \`UserDirectChats\``);
        await queryRunner.query(`DROP TABLE \`UserGroupChats\``);
        await queryRunner.query(`DROP TABLE \`UserConnectedUsers\``);
        await queryRunner.query(`DROP TABLE \`UserBlockedUsers\``);
        await queryRunner.query(`DROP INDEX \`IDX_5da3f86a40ce07289424c734c9\` ON \`Users\``);
        await queryRunner.query(`DROP INDEX \`IDX_3c3ab3f49a87e6ddb607f3c494\` ON \`Users\``);
        await queryRunner.query(`DROP TABLE \`Users\``);
        await queryRunner.query(`DROP TABLE \`GroupChats\``);
        await queryRunner.query(`DROP TABLE \`GroupChatMessages\``);
        await queryRunner.query(`DROP TABLE \`DirectChats\``);
        await queryRunner.query(`DROP TABLE \`AccountSettings\``);
    }

}
