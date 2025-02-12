import { Module } from '@nestjs/common';
import providers from '@modules/providers/providers';
import { AuthController } from '@controllers/auth/auth.controller';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [
		providers.CTF_AUTH_SERVICE,

		providers.CTF_EMAIL_SERVICE,

		providers.CTF_USERS_SERVICE,
		providers.CTF_USERS_REPOSITORY,
	],
})
export class AuthModule {}
