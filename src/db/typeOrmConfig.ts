import 'dotenv/config';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Database configuration
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: process.env.DATABASE_HOST || '',
	port: Number(process.env.DATABASE_PORT) || 3000,
	username: process.env.DATABASE_USERNAME || '',
	password: process.env.DATABASE_PASSWORD || '',
	database: process.env.DATABASE_NAME || '',
	ssl: {
		rejectUnauthorized: true,
	},
	entities: ['dist/src/db/entities/*.entity{.ts,.js}'],
	migrations: ['dist/src/db/migrations/*{.ts,.js}'],
	migrationsTableName: 'Migrations',
};

export const connectionSource = new DataSource(typeOrmConfig as DataSourceOptions);
