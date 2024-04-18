import { AuthController } from '@Controllers/auth.controller';
import {
	accountSettingsRepositoryProvider,
	authServiceProvider,
	emailServiceProvider,
	jwtTokensRepositoryProvider,
	jwtTokensServiceProvider,
	otpCodesRepositoryProvider,
	otpCodesServiceProvider,
	passwordResetTokensRepositoryProvider,
	passwordResetTokensServiceProvider,
	usersRepositoryProvider,
	usersServiceProvider,
} from '@Modules/providers/index';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [
		JwtService,
		usersServiceProvider,
		usersRepositoryProvider,
		otpCodesServiceProvider,
		otpCodesRepositoryProvider,
		authServiceProvider,
		accountSettingsRepositoryProvider,
		emailServiceProvider,
		jwtTokensServiceProvider,
		jwtTokensRepositoryProvider,
		passwordResetTokensServiceProvider,
		passwordResetTokensRepositoryProvider,
	],
})
export class AuthModule {}
