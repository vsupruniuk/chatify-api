import { MigrationInterface, QueryRunner } from "typeorm";

export class OnDeleteChanges1709500870464 implements MigrationInterface {
    name = 'OnDeleteChanges1709500870464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_0ad15ddaaa208e8897417237bfb"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_0ad15ddaaa208e8897417237bfb" FOREIGN KEY ("jwtTokenId") REFERENCES "JWTToken"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP CONSTRAINT "FK_0ad15ddaaa208e8897417237bfb"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD CONSTRAINT "FK_0ad15ddaaa208e8897417237bfb" FOREIGN KEY ("jwtTokenId") REFERENCES "JWTToken"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
