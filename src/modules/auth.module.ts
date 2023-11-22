import { Module } from '@nestjs/common';
import { AuthController } from '@Controllers/auth.controller';
import { UsersService } from '@Services/users.service';
import { CacheModule } from '@nestjs/cache-manager';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { AccountSettingsRepository } from '@Repositories/accountSettings.repository';
import { StatusesRepository } from '@Repositories/statuses.repository';
import { UsersRepository } from '@Repositories/users.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@Entities/User.entity';
import { AccountSettings } from '@Entities/AccountSettings.entity';
import { Status } from '@Entities/Status.entity';
import { EmailService } from '@Services/email.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, AccountSettings, Status])],
	controllers: [AuthController],
	providers: [
		{ provide: CustomProviders.I_USERS_SERVICE, useClass: UsersService },
		{ provide: CustomProviders.I_ACCOUNT_SETTINGS_REPOSITORY, useClass: AccountSettingsRepository },
		{ provide: CustomProviders.I_STATUSES_REPOSITORY, useClass: StatusesRepository },
		{ provide: CustomProviders.I_USERS_REPOSITORY, useClass: UsersRepository },
		{ provide: CustomProviders.I_EMAIL_SERVICE, useClass: EmailService },
	],
})
export class AuthModule {}

// TODO update API docks
