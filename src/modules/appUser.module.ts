import { AppUserController } from '@Controllers/appUser.controller';
import { jwtTokensRepositoryProvider, jwtTokensServiceProvider } from '@Modules/providers/index';
import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Module({
	controllers: [AppUserController],
	providers: [JwtService, jwtTokensServiceProvider, jwtTokensRepositoryProvider],
})
export class AppUserModule {}
