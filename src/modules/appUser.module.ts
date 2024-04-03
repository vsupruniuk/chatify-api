import { AppUserController } from '@Controllers/appUser.controller';
import {
	accountSettingsRepositoryProvider,
	accountSettingsServiceProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
	otpCodesRepositoryProvider,
	passwordResetTokensRepositoryProvider,
	usersRepositoryProvider,
	usersServiceProvider,
} from '@Modules/providers';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [CacheModule.register()],
	controllers: [AppUserController],
	providers: [
		JwtService,
		jwtTokensServiceProvider,
		jwtTokensRepositoryProvider,
		usersServiceProvider,
		usersRepositoryProvider,
		accountSettingsServiceProvider,
		accountSettingsRepositoryProvider,
		otpCodesRepositoryProvider,
		passwordResetTokensRepositoryProvider,
	],
})
export class AppUserModule {}
