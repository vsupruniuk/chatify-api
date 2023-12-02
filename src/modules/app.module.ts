import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { typeOrmConfig } from '@DB/typeOrmConfig';

import { AuthModule } from '@Modules/auth.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(typeOrmConfig),
		AuthModule,
		ThrottlerModule.forRoot([
			{
				ttl: Number(process.env.THROTTLE_TIME_TO_LIVE),
				limit: Number(process.env.THROTTLE_REQUESTS_LIMIT),
			},
		]),
	],
	controllers: [],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
