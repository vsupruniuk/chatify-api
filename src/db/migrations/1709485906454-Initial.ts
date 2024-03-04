import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1709485906454 implements MigrationInterface {
    name = 'Initial1709485906454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "AccountSettings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "enterIsSend" boolean NOT NULL DEFAULT false, "notification" boolean NOT NULL DEFAULT false, "twoStepVerification" boolean NOT NULL DEFAULT false, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_deddc188d3e5c1a272f1dd96be7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupChatMessages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dateTime" TIMESTAMP NOT NULL, "messageText" character varying(1000) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "groupChatId" uuid NOT NULL, "senderId" uuid NOT NULL, CONSTRAINT "PK_f3338aada51ad4588ab4ff69968" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupChats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avatarUrl" character varying(255), "name" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_356825014b3a97ec84322b8e98c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "JWTToken" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying(500) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_64fdb5a668e1dac8dc38ab60d37" UNIQUE ("token"), CONSTRAINT "PK_fc027c96ce8f4f148147b46af40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_64fdb5a668e1dac8dc38ab60d3" ON "JWTToken" ("token") `);
        await queryRunner.query(`CREATE TABLE "OTPCodes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d40f9bb436b8f32d9e8edab1c1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "PasswordResetTokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP, "token" character varying(255), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8579ec95bf0c091277a87355fe7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d38540590838b0135b0674fba9" ON "PasswordResetTokens" ("token") `);
        await queryRunner.query(`CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "about" character varying(255), "avatarUrl" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "firstName" character varying(255) NOT NULL, "isActivated" boolean NOT NULL DEFAULT false, "lastName" character varying(255), "nickname" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "accountSettingsId" uuid NOT NULL, "jwtTokenId" uuid, "otpCodeId" uuid, "passwordResetTokenId" uuid, CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "UQ_5da3f86a40ce07289424c734c98" UNIQUE ("nickname"), CONSTRAINT "REL_85ce482e4ffe6e098c6c736f60" UNIQUE ("accountSettingsId"), CONSTRAINT "REL_0ad15ddaaa208e8897417237bf" UNIQUE ("jwtTokenId"), CONSTRAINT "REL_64f66d1ef6ef871789881d0e2e" UNIQUE ("otpCodeId"), CONSTRAINT "REL_cc901297cc0ed6a6ea17632013" UNIQUE ("passwordResetTokenId"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3c3ab3f49a87e6ddb607f3c494" ON "Users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5da3f86a40ce07289424c734c9" ON "Users" ("nickname") `);
        await queryRunner.query(`CREATE TABLE "DirectChats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_17b02abfc8020b040fdf4833277" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "DirectChatMessages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "dateTime" TIMESTAMP NOT NULL, "messageText" character varying(1000) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "directChatId" uuid NOT NULL, "senderId" uuid NOT NULL, CONSTRAINT "PK_fe73521a0489dd99ba442ae1202" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "GroupChatUsers" ("groupChatId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_69d6229a28c100e5d331122a339" PRIMARY KEY ("groupChatId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c180f848bd0b223308351ee2c3" ON "GroupChatUsers" ("groupChatId") `);
        await queryRunner.query(`CREATE INDEX "IDX_69b2818b987c3a4e6f9673e2a9" ON "GroupChatUsers" ("userId") `);
        await queryRunner.query(`CREATE TABLE "UserBlockedUsers" ("userId" uuid NOT NULL, "blockedUserId" uuid NOT NULL, CONSTRAINT "PK_ec7a29ce4e24162bf0c417baf14" PRIMARY KEY ("userId", "blockedUserId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_92c5adef1aa29dea7243b439d5" ON "UserBlockedUsers" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9f7767efbb64840e52686a6b10" ON "UserBlockedUsers" ("blockedUserId") `);
        await queryRunner.query(`CREATE TABLE "DirectChatUsers" ("directChatId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_bf91f299c28aba31479963b2315" PRIMARY KEY ("directChatId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_62317fb9be332ce5a27d9dba99" ON "DirectChatUsers" ("directChatId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c52b0a3d9f06de615c3eebf344" ON "DirectChatUsers" ("userId") `);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" ADD CONSTRAINT "FK_ac37556d6870ec3356f26c60c88" FOREIGN KEY ("groupChatId") REFERENCES "GroupChats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" ADD CONSTRAINT "FK_952c26b69d580e0ac50824659d4" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_85ce482e4ffe6e098c6c736f603" FOREIGN KEY ("accountSettingsId") REFERENCES "AccountSettings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_0ad15ddaaa208e8897417237bfb" FOREIGN KEY ("jwtTokenId") REFERENCES "JWTToken"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_64f66d1ef6ef871789881d0e2e1" FOREIGN KEY ("otpCodeId") REFERENCES "OTPCodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_cc901297cc0ed6a6ea176320137" FOREIGN KEY ("passwordResetTokenId") REFERENCES "PasswordResetTokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" ADD CONSTRAINT "FK_508f05ad230e14a4a3dc8cd7915" FOREIGN KEY ("directChatId") REFERENCES "DirectChats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" ADD CONSTRAINT "FK_9f8bbbaa324fd8499d59d2ab3f6" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" ADD CONSTRAINT "FK_c180f848bd0b223308351ee2c32" FOREIGN KEY ("groupChatId") REFERENCES "GroupChats"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" ADD CONSTRAINT "FK_69b2818b987c3a4e6f9673e2a94" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" ADD CONSTRAINT "FK_92c5adef1aa29dea7243b439d51" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" ADD CONSTRAINT "FK_9f7767efbb64840e52686a6b107" FOREIGN KEY ("blockedUserId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" ADD CONSTRAINT "FK_62317fb9be332ce5a27d9dba99a" FOREIGN KEY ("directChatId") REFERENCES "DirectChats"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" ADD CONSTRAINT "FK_c52b0a3d9f06de615c3eebf3443" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" DROP CONSTRAINT "FK_c52b0a3d9f06de615c3eebf3443"`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" DROP CONSTRAINT "FK_62317fb9be332ce5a27d9dba99a"`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" DROP CONSTRAINT "FK_9f7767efbb64840e52686a6b107"`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" DROP CONSTRAINT "FK_92c5adef1aa29dea7243b439d51"`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" DROP CONSTRAINT "FK_69b2818b987c3a4e6f9673e2a94"`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" DROP CONSTRAINT "FK_c180f848bd0b223308351ee2c32"`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" DROP CONSTRAINT "FK_9f8bbbaa324fd8499d59d2ab3f6"`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" DROP CONSTRAINT "FK_508f05ad230e14a4a3dc8cd7915"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_cc901297cc0ed6a6ea176320137"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_64f66d1ef6ef871789881d0e2e1"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_0ad15ddaaa208e8897417237bfb"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_85ce482e4ffe6e098c6c736f603"`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" DROP CONSTRAINT "FK_952c26b69d580e0ac50824659d4"`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" DROP CONSTRAINT "FK_ac37556d6870ec3356f26c60c88"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c52b0a3d9f06de615c3eebf344"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_62317fb9be332ce5a27d9dba99"`);
        await queryRunner.query(`DROP TABLE "DirectChatUsers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f7767efbb64840e52686a6b10"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_92c5adef1aa29dea7243b439d5"`);
        await queryRunner.query(`DROP TABLE "UserBlockedUsers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_69b2818b987c3a4e6f9673e2a9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c180f848bd0b223308351ee2c3"`);
        await queryRunner.query(`DROP TABLE "GroupChatUsers"`);
        await queryRunner.query(`DROP TABLE "DirectChatMessages"`);
        await queryRunner.query(`DROP TABLE "DirectChats"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5da3f86a40ce07289424c734c9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c3ab3f49a87e6ddb607f3c494"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d38540590838b0135b0674fba9"`);
        await queryRunner.query(`DROP TABLE "PasswordResetTokens"`);
        await queryRunner.query(`DROP TABLE "OTPCodes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_64fdb5a668e1dac8dc38ab60d3"`);
        await queryRunner.query(`DROP TABLE "JWTToken"`);
        await queryRunner.query(`DROP TABLE "GroupChats"`);
        await queryRunner.query(`DROP TABLE "GroupChatMessages"`);
        await queryRunner.query(`DROP TABLE "AccountSettings"`);
    }

}
