import { MigrationInterface, QueryRunner } from "typeorm";

export class JwtTokenAndPasswordResetTokenChanges1739289369238 implements MigrationInterface {
    name = 'JwtTokenAndPasswordResetTokenChanges1739289369238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jwt_tokens" ALTER COLUMN "token" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jwt_tokens" ALTER COLUMN "token" SET NOT NULL`);
    }

}
