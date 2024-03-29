import { AppUserModule } from '@Modules/appUser.module';
import { throttlerGuardProvider } from '@Modules/providers/index';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { typeOrmConfig } from '@DB/typeOrmConfig';
import { AuthModule } from '@Modules/auth.module';

@Module({
	imports: [
		AuthModule,
		AppUserModule,
		ConfigModule.forRoot(),
		TypeOrmModule.forRoot(typeOrmConfig),
		ThrottlerModule.forRoot([
			{
				ttl: Number(process.env.THROTTLE_TIME_TO_LIVE) || 1000000,
				limit: Number(process.env.THROTTLE_REQUESTS_LIMIT) || 100,
			},
		]),
	],
	controllers: [],
	providers: [throttlerGuardProvider],
})
export class AppModule {}
