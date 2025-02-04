import 'dotenv/config';
import { Environments } from '@Enums/Environments.enum';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

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
	entities: [String(process.env.DATABASE_ENTITIES_PATH)],
	migrations: [String(process.env.DATABASE_MIGRATIONS_PATH)],
	migrationsTableName: 'Migrations',
	ssl: process.env.NODE_ENV === Environments.DEV ? false : { rejectUnauthorized: false },
};

export const typeOrmConfigMock: TypeOrmModuleOptions = {
	type: 'sqlite',
	database: ':memory:',
	synchronize: true,
};

export const connectionSource = new DataSource(typeOrmConfig);
