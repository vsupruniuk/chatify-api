import { DBTables } from '@Enums/db/DBTables.enum';
import { DBTypes } from '@Enums/db/DBTypes.enum';
import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class AddPasswordResetToken1704727989104 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumn(
			DBTables.USERS,
			new TableColumn({
				name: 'passwordResetToken',
				type: DBTypes.VARCHAR,
				length: '255',
				isNullable: true,
			}),
		);

		await queryRunner.createIndex(
			DBTables.USERS,
			new TableIndex({
				name: 'IDX_USER_PASSWORD_RESET_TOKEN',
				columnNames: ['passwordResetToken'],
			}),
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropColumn(DBTables.USERS, 'passwordResetToken');
	}
}
