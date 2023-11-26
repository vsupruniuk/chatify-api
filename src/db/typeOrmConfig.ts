import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Database configuration
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	ssl: {
		rejectUnauthorized: true,
	},
	entities: ['dist/src/db/entities/*.entity{.ts,.js}'],
	migrations: ['dist/db/migrations/*{.ts,.js}'],
};

export const connectionSource = new DataSource(typeOrmConfig as DataSourceOptions);
