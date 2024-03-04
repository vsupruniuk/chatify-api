import { MigrationInterface, QueryRunner } from "typeorm";

export class OnDelete1709501615438 implements MigrationInterface {
    name = 'OnDelete1709501615438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" DROP CONSTRAINT "FK_9f8bbbaa324fd8499d59d2ab3f6"`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" DROP CONSTRAINT "FK_952c26b69d580e0ac50824659d4"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_64f66d1ef6ef871789881d0e2e1"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_cc901297cc0ed6a6ea176320137"`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" DROP CONSTRAINT "FK_62317fb9be332ce5a27d9dba99a"`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" DROP CONSTRAINT "FK_c52b0a3d9f06de615c3eebf3443"`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" DROP CONSTRAINT "FK_c180f848bd0b223308351ee2c32"`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" DROP CONSTRAINT "FK_69b2818b987c3a4e6f9673e2a94"`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" DROP CONSTRAINT "FK_92c5adef1aa29dea7243b439d51"`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" ADD CONSTRAINT "FK_9f8bbbaa324fd8499d59d2ab3f6" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" ADD CONSTRAINT "FK_952c26b69d580e0ac50824659d4" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_64f66d1ef6ef871789881d0e2e1" FOREIGN KEY ("otpCodeId") REFERENCES "OTPCodes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_cc901297cc0ed6a6ea176320137" FOREIGN KEY ("passwordResetTokenId") REFERENCES "PasswordResetTokens"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" ADD CONSTRAINT "FK_62317fb9be332ce5a27d9dba99a" FOREIGN KEY ("directChatId") REFERENCES "DirectChats"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" ADD CONSTRAINT "FK_c52b0a3d9f06de615c3eebf3443" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" ADD CONSTRAINT "FK_c180f848bd0b223308351ee2c32" FOREIGN KEY ("groupChatId") REFERENCES "GroupChats"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" ADD CONSTRAINT "FK_69b2818b987c3a4e6f9673e2a94" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" ADD CONSTRAINT "FK_92c5adef1aa29dea7243b439d51" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" DROP CONSTRAINT "FK_92c5adef1aa29dea7243b439d51"`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" DROP CONSTRAINT "FK_69b2818b987c3a4e6f9673e2a94"`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" DROP CONSTRAINT "FK_c180f848bd0b223308351ee2c32"`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" DROP CONSTRAINT "FK_c52b0a3d9f06de615c3eebf3443"`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" DROP CONSTRAINT "FK_62317fb9be332ce5a27d9dba99a"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_cc901297cc0ed6a6ea176320137"`);
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_64f66d1ef6ef871789881d0e2e1"`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" DROP CONSTRAINT "FK_952c26b69d580e0ac50824659d4"`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" DROP CONSTRAINT "FK_9f8bbbaa324fd8499d59d2ab3f6"`);
        await queryRunner.query(`ALTER TABLE "UserBlockedUsers" ADD CONSTRAINT "FK_92c5adef1aa29dea7243b439d51" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" ADD CONSTRAINT "FK_69b2818b987c3a4e6f9673e2a94" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupChatUsers" ADD CONSTRAINT "FK_c180f848bd0b223308351ee2c32" FOREIGN KEY ("groupChatId") REFERENCES "GroupChats"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" ADD CONSTRAINT "FK_c52b0a3d9f06de615c3eebf3443" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DirectChatUsers" ADD CONSTRAINT "FK_62317fb9be332ce5a27d9dba99a" FOREIGN KEY ("directChatId") REFERENCES "DirectChats"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_cc901297cc0ed6a6ea176320137" FOREIGN KEY ("passwordResetTokenId") REFERENCES "PasswordResetTokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_64f66d1ef6ef871789881d0e2e1" FOREIGN KEY ("otpCodeId") REFERENCES "OTPCodes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "GroupChatMessages" ADD CONSTRAINT "FK_952c26b69d580e0ac50824659d4" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "DirectChatMessages" ADD CONSTRAINT "FK_9f8bbbaa324fd8499d59d2ab3f6" FOREIGN KEY ("senderId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
