import { AppUserModule } from '@Modules/appUser.module';
import { DirectChatsModule } from '@Modules/directChats.module';
import { SearchModule } from '@Modules/search.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { typeOrmConfig, typeOrmConfigMock } from '@DB/typeOrmConfig';
import { AuthModule } from '@Modules/auth.module';
import { Environments } from '@Enums/Environments.enum';
import { StaticModule } from '@Modules/static.module';
import providers from '@Modules/providers/providers';

@Module({
	imports: [
		AuthModule,
		AppUserModule,
		SearchModule,
		DirectChatsModule,
		StaticModule,
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
				ttl: Number(process.env.THROTTLE_TIME_TO_LIVE),
				limit: Number(process.env.THROTTLE_REQUESTS_LIMIT),
			},
		]),
	],
	controllers: [],
	providers: [providers.CTF_THROTTLER_GUARD],
})
export class AppModule {}
