import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { providers } from '@modules/providers';

import { AppUserController } from '@controllers';

@Module({
	controllers: [AppUserController],
	providers: [
		JwtService,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,

		providers.CTF_APP_USER_SERVICE,
		providers.CTF_USERS_REPOSITORY,

		providers.CTF_ACCOUNT_SETTINGS_SERVICE,
		providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,

		providers.CTF_USERS_SERVICE,
		providers.CTF_USERS_REPOSITORY,
	],
})
export class AppUserModule {}
