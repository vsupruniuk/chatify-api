import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@Entities/User.entity';
import { OTPCode } from '@Entities/OTPCode.entity';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { CustomProviders } from '@Enums/CustomProviders.enum';

import { AuthController } from '@Controllers/auth.controller';
import { UsersService } from '@Services/users.service';
import { EmailService } from '@Services/email.service';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { OTPCodesRepository } from '@Repositories/OTPCodes.repository';

@Module({
	imports: [TypeOrmModule.forFeature([User, AccountSettings, OTPCode])],
	controllers: [AuthController],
	providers: [
		{ provide: CustomProviders.I_USERS_SERVICE, useClass: UsersService },
		{ provide: CustomProviders.I_EMAIL_SERVICE, useClass: EmailService },
		{ provide: CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY, useClass: AccountSettingsRepository },
		{ provide: CustomProviders.I_USERS_REPOSITORY, useClass: UsersRepository },
		{ provide: CustomProviders.I_OTP_CODES_REPOSITORY, useClass: OTPCodesRepository },
	],
})
export class AuthModule {}
