import { AppUserModule } from '@Modules/appUser.module';
import { DirectChatsModule } from '@Modules/directChats.module';
import { SearchModule } from '@Modules/search.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { typeOrmConfig, typeOrmConfigMock } from '@DB/typeOrmConfig';
import { AuthModule } from '@Modules/auth.module';
import { join } from 'path';
import { throttlerGuardProvider } from '@Modules/providers';
import { Environments } from '@Enums/Environments.enum';

@Module({
	imports: [
		AuthModule,
		AppUserModule,
		SearchModule,
		DirectChatsModule,
		ConfigModule.forRoot(),
		TypeOrmModule.forRootAsync({
			useFactory: () => {
				if (process.env.NODE_ENV === Environments.TEST) {
					return typeOrmConfigMock;
				}

				return typeOrmConfig;
			},
		}),
		ThrottlerModule.forRoot([
			{
				ttl: Number(process.env.THROTTLE_TIME_TO_LIVE) || 1000000,
				limit: Number(process.env.THROTTLE_REQUESTS_LIMIT) || 100,
			},
		]),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '../../../', 'public'),
		}),
	],
	controllers: [],
	providers: [throttlerGuardProvider],
})
export class AppModule {}
