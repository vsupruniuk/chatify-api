import { StartedTestContainer } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

import { typeOrmConfig } from '@configs';

export class TestDatabaseHelper {
	private static readonly _postgresImage: string = 'postgres:14';

	public static async initDbContainer(): Promise<StartedTestContainer> {
		return await new PostgreSqlContainer(this._postgresImage)
			.withDatabase(String(process.env.DATABASE_NAME))
			.withUsername(String(process.env.DATABASE_USERNAME))
			.withPassword(String(process.env.DATABASE_PASSWORD))
			.start();
	}

	public static async initDataSource(postgresContainer: StartedTestContainer): Promise<DataSource> {
		return await new DataSource({
			...typeOrmConfig,
			host: postgresContainer.getHost(),
			port: postgresContainer.getMappedPort(Number(process.env.DATABASE_PORT)),
			synchronize: true,
		}).initialize();
	}
}
