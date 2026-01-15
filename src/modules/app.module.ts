import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

import { providers } from '@modules/providers';

import { throttlerConfig, typeOrmConfig } from '@configs';

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

		TypeOrmModule.forRoot(typeOrmConfig),
		ThrottlerModule.forRoot([throttlerConfig]),
	],
	controllers: [],
	providers: [providers.CTF_THROTTLER_GUARD],
})
export class AppModule {}
