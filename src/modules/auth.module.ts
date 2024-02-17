import { AuthController } from '@Controllers/auth.controller';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { JWTToken } from '@Entities/JWTToken.entity';
import { OTPCode } from '@Entities/OTPCode.entity';
import { PasswordResetToken } from '@Entities/PasswordResetToken.entity';

import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { AuthService } from '@Services/auth.service';
import { EmailService } from '@Services/email.service';
import { JwtTokensService } from '@Services/jwtTokens.service';
import { OTPCodesService } from '@Services/OTPCodes.service';
import { PasswordResetTokensService } from '@Services/passwordResetTokens.service';
import { UsersService } from '@Services/users.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, AccountSettings, OTPCode, JWTToken, PasswordResetToken]),
	],
	controllers: [AuthController],
	providers: [
		JwtService,
		{ provide: CustomProviders.I_USERS_SERVICE, useClass: UsersService },
		{ provide: CustomProviders.I_USERS_REPOSITORY, useClass: UsersRepository },
		{ provide: CustomProviders.I_OTP_CODES_SERVICE, useClass: OTPCodesService },
		{ provide: CustomProviders.I_OTP_CODES_REPOSITORY, useClass: OTPCodesRepository },
		{ provide: CustomProviders.I_AUTH_SERVICE, useClass: AuthService },
		{ provide: CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY, useClass: AccountSettingsRepository },
		{ provide: CustomProviders.I_EMAIL_SERVICE, useClass: EmailService },
		{ provide: CustomProviders.I_JWT_TOKENS_SERVICE, useClass: JwtTokensService },
		{ provide: CustomProviders.I_JWT_TOKENS_REPOSITORY, useClass: JWTTokensRepository },
		{
			provide: CustomProviders.I_PASSWORD_RESET_TOKENS_SERVICE,
			useClass: PasswordResetTokensService,
		},
		{
			provide: CustomProviders.I_PASSWORD_RESET_TOKENS_REPOSITORY,
			useClass: PasswordResetTokensRepository,
		},
	],
})
export class AuthModule {}
