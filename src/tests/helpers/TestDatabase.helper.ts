import { StartedTestContainer } from 'testcontainers';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';

import { testsConfig, typeOrmConfig } from '@configs';

export class TestDatabaseHelper {
	public static async initDbContainer(): Promise<StartedTestContainer> {
		return await new PostgreSqlContainer(testsConfig.postgresImage)
			.withDatabase(String(typeOrmConfig.database))
			.withUsername(String(typeOrmConfig.username))
			.withPassword(String(typeOrmConfig.password))
			.start();
	}

	public static async initDataSource(postgresContainer: StartedTestContainer): Promise<DataSource> {
		return await new DataSource({
			...typeOrmConfig,
			host: postgresContainer.getHost(),
			port: postgresContainer.getMappedPort(Number(typeOrmConfig.port)),
			synchronize: true,
		}).initialize();
	}
}
