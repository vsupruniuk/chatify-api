import 'dotenv/config';
import { Environments } from '../types/enums/Environments.enum';

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Database configuration
 */
export let typeOrmConfig: TypeOrmModuleOptions = {
	type: 'postgres',
	host: process.env.DATABASE_HOST || '',
	port: Number(process.env.DATABASE_PORT) || 3000,
	username: process.env.DATABASE_USERNAME || '',
	password: process.env.DATABASE_PASSWORD || '',
	database: process.env.DATABASE_NAME || '',
	entities: ['dist/src/db/entities/*.entity{.ts,.js}'],
	migrations: ['dist/src/db/migrations/*{.ts,.js}'],
	migrationsTableName: 'Migrations',
};

if (process.env.NODE_ENV !== Environments.DEV) {
	typeOrmConfig = { ...typeOrmConfig, ssl: { rejectUnauthorized: false } };
}

export const typeOrmConfigMock: TypeOrmModuleOptions = {
	type: 'sqlite',
	database: ':memory:',
	synchronize: true,
};

export const connectionSource = new DataSource(typeOrmConfig as DataSourceOptions);
