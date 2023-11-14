import { Module } from '@nestjs/common';
import { AuthController } from '@Controllers/auth.controller';
import { UsersService } from '@Services/users.service';
import { CustomProviders } from '@Enums/CustomProviders.enum';
import { UsersRepository } from '@Repositories/users.repository';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
	imports: [CacheModule.register()],
	controllers: [AuthController],
	providers: [
		UsersService,
		{ provide: CustomProviders.I_USERS_REPOSITORY, useClass: UsersRepository },
	],
})
export class AuthModule {}
