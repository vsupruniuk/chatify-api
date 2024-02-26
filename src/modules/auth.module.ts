import { AuthController } from '@Controllers/auth.controller';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { JWTToken } from '@Entities/JWTToken.entity';
import { OTPCode } from '@Entities/OTPCode.entity';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';
import { User } from '@Entities/User.entity';
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
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, AccountSettings, OTPCode, JWTToken, PasswordResetToken]),
	],
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
