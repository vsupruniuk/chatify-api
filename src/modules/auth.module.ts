import { AuthController } from '@Controllers/auth.controller';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import providers from '@Modules/providers/providers';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [
		JwtService,

		providers.CTF_USERS_SERVICE,
		providers.CTF_USERS_REPOSITORY,

		providers.CTF_OTP_CODES_SERVICE,
		providers.CTF_OTP_CODES_REPOSITORY,

		providers.CTF_AUTH_SERVICE,

		providers.CTF_ACCOUNT_SETTINGS_REPOSITORY,

		providers.CTF_EMAIL_SERVICE,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,

		providers.CTF_PASSWORD_RESET_TOKENS_SERVICE,
		providers.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,
	],
})
export class AuthModule {}
