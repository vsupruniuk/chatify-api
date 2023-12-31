import { AuthController } from '@Controllers/auth.controller';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { OTPCode } from '@Entities/OTPCode.entity';

import { User } from '@Entities/User.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { AuthService } from '@Services/auth.service';
import { EmailService } from '@Services/email.service';
import { OTPCodesService } from '@Services/OTPCodes.service';
import { UsersService } from '@Services/users.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, AccountSettings, OTPCode])],
	controllers: [AuthController],
	providers: [
		{ provide: CustomProviders.I_USERS_SERVICE, useClass: UsersService },
		{ provide: CustomProviders.I_USERS_REPOSITORY, useClass: UsersRepository },
		{ provide: CustomProviders.I_OTP_CODES_SERVICE, useClass: OTPCodesService },
		{ provide: CustomProviders.I_OTP_CODES_REPOSITORY, useClass: OTPCodesRepository },
		{ provide: CustomProviders.I_AUTH_SERVICE, useClass: AuthService },
		{ provide: CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY, useClass: AccountSettingsRepository },
		{ provide: CustomProviders.I_EMAIL_SERVICE, useClass: EmailService },
	],
})
export class AuthModule {}
