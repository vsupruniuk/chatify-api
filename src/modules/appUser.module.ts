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
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
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
