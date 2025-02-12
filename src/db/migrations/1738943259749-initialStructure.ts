import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialStructure1738943259749 implements MigrationInterface {
    name = 'InitialStructure1738943259749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "account_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "enter_is_sending" boolean NOT NULL DEFAULT false, "notification" boolean NOT NULL DEFAULT false, "two_step_verification" boolean NOT NULL DEFAULT false, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cede89a31d2392a1064087af67a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "direct_chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "date_time" TIMESTAMP NOT NULL DEFAULT now(), "message_text" character varying(1000) NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "direct_chat_id" uuid NOT NULL, "sender_id" uuid NOT NULL, CONSTRAINT "PK_09bbff1bbdc857ffc1d0703e6a7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "direct_chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_664d08673d3e1b661b657f86783" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "date_time" TIMESTAMP NOT NULL DEFAULT now(), "messageText" character varying(1000) NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "group_chat_id" uuid NOT NULL, "sender_id" uuid NOT NULL, CONSTRAINT "PK_c92640c08db1752043a7b77e97a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "group_chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "avatar_url" character varying(255), "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2850524c61524bab74e754a2335" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jwt_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying(500) NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6068d31523327620c890162fe54" UNIQUE ("token"), CONSTRAINT "PK_39d449f39a9d27f58bb223ffb26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6068d31523327620c890162fe5" ON "jwt_tokens" ("token") `);
        await queryRunner.query(`CREATE TABLE "otp_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9d0487965ac1837d57fec4d6a26" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, "token" character varying(255), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ab673f0e63eac966762155508e" ON "password_reset_tokens" ("token") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "about" character varying(255), "avatar_url" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(255) NOT NULL, "first_name" character varying(255) NOT NULL, "is_activated" boolean NOT NULL DEFAULT false, "last_name" character varying(255), "nickname" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "account_settings_id" uuid NOT NULL, "jwt_token_id" uuid, "otp_code_id" uuid, "password_reset_token_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_ad02a1be8707004cb805a4b5023" UNIQUE ("nickname"), CONSTRAINT "REL_a2cb2268bf72165d1a610c162c" UNIQUE ("account_settings_id"), CONSTRAINT "REL_ce4646f807c28594f20ede62b0" UNIQUE ("jwt_token_id"), CONSTRAINT "REL_54126e69b4f3008cb9e4c8c1d7" UNIQUE ("otp_code_id"), CONSTRAINT "REL_13d14a821c9884972dbd81bb72" UNIQUE ("password_reset_token_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ad02a1be8707004cb805a4b502" ON "users" ("nickname") `);
        await queryRunner.query(`CREATE TABLE "direct_chats_users" ("direct_chat_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_7c21e203f6ebad240692c5da7bc" PRIMARY KEY ("direct_chat_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a47dae787c9cc1dba5dc798bbb" ON "direct_chats_users" ("direct_chat_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_53539542702b1436a877234aed" ON "direct_chats_users" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "group_chats_users" ("group_chat_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_8253e65f218e66ad1a5bb067b64" PRIMARY KEY ("group_chat_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9eccf7f3ee4cfa3359c89073b7" ON "group_chats_users" ("group_chat_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_3b32776ca3d91a137680f92876" ON "group_chats_users" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user_blocked_users" ("user_id" uuid NOT NULL, "blocked_user_id" uuid NOT NULL, CONSTRAINT "PK_e236c2ee0c9ba3e6983ff02f1d7" PRIMARY KEY ("user_id", "blocked_user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_851610d9cacc8ef00f1befb21b" ON "user_blocked_users" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8ddff986560b1c4f44a367d2a6" ON "user_blocked_users" ("blocked_user_id") `);
        await queryRunner.query(`ALTER TABLE "direct_chat_messages" ADD CONSTRAINT "FK_62c9bc32d0cceb331c2e6fa8a25" FOREIGN KEY ("direct_chat_id") REFERENCES "direct_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "direct_chat_messages" ADD CONSTRAINT "FK_c7b25591a2c1037c5bb5e1f6708" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_chat_messages" ADD CONSTRAINT "FK_500f385783f0188a5891036983d" FOREIGN KEY ("group_chat_id") REFERENCES "group_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_chat_messages" ADD CONSTRAINT "FK_8ff4902eb9998a7267317ae8419" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cb2268bf72165d1a610c162c2" FOREIGN KEY ("account_settings_id") REFERENCES "account_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_ce4646f807c28594f20ede62b00" FOREIGN KEY ("jwt_token_id") REFERENCES "jwt_tokens"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_54126e69b4f3008cb9e4c8c1d73" FOREIGN KEY ("otp_code_id") REFERENCES "otp_codes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_13d14a821c9884972dbd81bb727" FOREIGN KEY ("password_reset_token_id") REFERENCES "password_reset_tokens"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "direct_chats_users" ADD CONSTRAINT "FK_a47dae787c9cc1dba5dc798bbba" FOREIGN KEY ("direct_chat_id") REFERENCES "direct_chats"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "direct_chats_users" ADD CONSTRAINT "FK_53539542702b1436a877234aed6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "group_chats_users" ADD CONSTRAINT "FK_9eccf7f3ee4cfa3359c89073b72" FOREIGN KEY ("group_chat_id") REFERENCES "group_chats"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "group_chats_users" ADD CONSTRAINT "FK_3b32776ca3d91a137680f928764" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_blocked_users" ADD CONSTRAINT "FK_851610d9cacc8ef00f1befb21b2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_blocked_users" ADD CONSTRAINT "FK_8ddff986560b1c4f44a367d2a6e" FOREIGN KEY ("blocked_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_blocked_users" DROP CONSTRAINT "FK_8ddff986560b1c4f44a367d2a6e"`);
        await queryRunner.query(`ALTER TABLE "user_blocked_users" DROP CONSTRAINT "FK_851610d9cacc8ef00f1befb21b2"`);
        await queryRunner.query(`ALTER TABLE "group_chats_users" DROP CONSTRAINT "FK_3b32776ca3d91a137680f928764"`);
        await queryRunner.query(`ALTER TABLE "group_chats_users" DROP CONSTRAINT "FK_9eccf7f3ee4cfa3359c89073b72"`);
        await queryRunner.query(`ALTER TABLE "direct_chats_users" DROP CONSTRAINT "FK_53539542702b1436a877234aed6"`);
        await queryRunner.query(`ALTER TABLE "direct_chats_users" DROP CONSTRAINT "FK_a47dae787c9cc1dba5dc798bbba"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_13d14a821c9884972dbd81bb727"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_54126e69b4f3008cb9e4c8c1d73"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_ce4646f807c28594f20ede62b00"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cb2268bf72165d1a610c162c2"`);
        await queryRunner.query(`ALTER TABLE "group_chat_messages" DROP CONSTRAINT "FK_8ff4902eb9998a7267317ae8419"`);
        await queryRunner.query(`ALTER TABLE "group_chat_messages" DROP CONSTRAINT "FK_500f385783f0188a5891036983d"`);
        await queryRunner.query(`ALTER TABLE "direct_chat_messages" DROP CONSTRAINT "FK_c7b25591a2c1037c5bb5e1f6708"`);
        await queryRunner.query(`ALTER TABLE "direct_chat_messages" DROP CONSTRAINT "FK_62c9bc32d0cceb331c2e6fa8a25"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8ddff986560b1c4f44a367d2a6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_851610d9cacc8ef00f1befb21b"`);
        await queryRunner.query(`DROP TABLE "user_blocked_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3b32776ca3d91a137680f92876"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9eccf7f3ee4cfa3359c89073b7"`);
        await queryRunner.query(`DROP TABLE "group_chats_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53539542702b1436a877234aed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a47dae787c9cc1dba5dc798bbb"`);
        await queryRunner.query(`DROP TABLE "direct_chats_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ad02a1be8707004cb805a4b502"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ab673f0e63eac966762155508e"`);
        await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
        await queryRunner.query(`DROP TABLE "otp_codes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6068d31523327620c890162fe5"`);
        await queryRunner.query(`DROP TABLE "jwt_tokens"`);
        await queryRunner.query(`DROP TABLE "group_chats"`);
        await queryRunner.query(`DROP TABLE "group_chat_messages"`);
        await queryRunner.query(`DROP TABLE "direct_chats"`);
        await queryRunner.query(`DROP TABLE "direct_chat_messages"`);
        await queryRunner.query(`DROP TABLE "account_settings"`);
    }

}
