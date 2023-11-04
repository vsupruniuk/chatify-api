import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const ormConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: process.env.DATABASE_HOST,
	port: Number(process.env.DATABASE_PORT),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	ssl: {
		rejectUnauthorized: true,
	},
	entities: ['dist/**/*.entity{.ts,.js}'],
};
