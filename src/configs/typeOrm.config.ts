import 'dotenv/config';

import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as path from 'path';

import { Environment } from '@enums';

import * as entities from '@entities';

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
	ssl: process.env.NODE_ENV !== Environment.PROD ? false : { rejectUnauthorized: true },
	logging: process.env.NODE_ENV === Environment.DEV ? ['query', 'error', 'warn'] : false,
} as const;

export default new DataSource(typeOrmConfig);
