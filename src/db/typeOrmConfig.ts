import 'dotenv/config';
import { Environments } from '@enums/Environments.enum';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import * as entities from '@db/entities';
import * as path from 'path';

/**
 * Database configuration
 */
export const typeOrmConfig: PostgresConnectionOptions = {
	type: 'postgres',
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	entities: Object.values(entities),
	migrations: [path.resolve(__dirname, String(process.env.DATABASE_MIGRATIONS_PATH))],
	migrationsTableName: 'migrations',
	ssl: process.env.NODE_ENV !== Environments.PROD ? false : { rejectUnauthorized: true },
	logging: process.env.NODE_ENV === Environments.DEV ? ['query', 'error', 'warn'] : false,
};

export default new DataSource(typeOrmConfig);
