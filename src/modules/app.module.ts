import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppUserModule } from '@modules/appUser.module';
import { AuthModule } from '@modules/auth.module';
import { SearchModule } from '@modules/search.module';
import { DirectChatsModule } from '@modules/directChats.module';
import { StaticModule } from '@modules/static.module';
import { Environments } from '@enums/Environments.enum';
import { typeOrmConfig, typeOrmConfigMock } from '@db/typeOrmConfig';
import providers from '@modules/providers/providers';

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
