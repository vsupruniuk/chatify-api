import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexsUpdate1708011773482 implements MigrationInterface {
    name = 'IndexsUpdate1708011773482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_d38540590838b0135b0674fba9\` ON \`PasswordResetTokens\` (\`token\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_d38540590838b0135b0674fba9\` ON \`PasswordResetTokens\``);
    }

}
