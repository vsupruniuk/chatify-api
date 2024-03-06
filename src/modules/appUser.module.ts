import { AppUserController } from '@Controllers/appUser.controller';
import {
	accountSettingsRepositoryProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
	otpCodesRepositoryProvider,
	passwordResetTokensRepositoryProvider,
	usersRepositoryProvider,
	usersServiceProvider,
} from '@Modules/providers/index';
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
		accountSettingsRepositoryProvider,
		otpCodesRepositoryProvider,
		passwordResetTokensRepositoryProvider,
	],
})
export class AppUserModule {}
