import { MigrationInterface, QueryRunner } from "typeorm";

export class JWTToken1706363711926 implements MigrationInterface {
    name = 'JWTToken1706363711926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`JWTToken\` (\`id\` varchar(36) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`token\` varchar(500) NOT NULL, \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_64fdb5a668e1dac8dc38ab60d3\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Users\` ADD \`JWTTokenId\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Users\` DROP COLUMN \`JWTTokenId\``);
        await queryRunner.query(`DROP INDEX \`IDX_64fdb5a668e1dac8dc38ab60d3\` ON \`JWTToken\``);
        await queryRunner.query(`DROP TABLE \`JWTToken\``);
    }

}
