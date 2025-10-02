import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { providers } from '@modules/providers';

import { typeOrmConfig } from '@configs';

import { AuthModule } from './auth.module';
import { AppUserModule } from './appUser.module';
import { SearchModule } from './search.module';
import { DirectChatsModule } from './directChats.module';
import { StaticModule } from './static.module';

@Module({
	imports: [
		AuthModule,
		AppUserModule,
		SearchModule,
		DirectChatsModule,
		StaticModule,
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(typeOrmConfig),
		ThrottlerModule.forRoot([
			{
				ttl: Number(process.env.THROTTLE_TIME_TO_LIVE),
				limit: Number(process.env.THROTTLE_REQUESTS_LIMIT),
			},
		]),
	],
	controllers: [],
	providers: [providers.CTF_THROTTLER_GUARD],
})
export class AppModule {}
