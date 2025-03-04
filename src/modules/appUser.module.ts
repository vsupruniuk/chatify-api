import { Module } from '@nestjs/common';
import { AppUserController } from '@controllers/appUser/appUser.controller';
import providers from '@modules/providers/providers';
import { JwtService } from '@nestjs/jwt';

@Module({
	controllers: [AppUserController],
	providers: [
		JwtService,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,

		providers.CTF_USERS_SERVICE,
		providers.CTF_USERS_REPOSITORY,
	],
})
export class AppUserModule {}
