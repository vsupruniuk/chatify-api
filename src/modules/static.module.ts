import { Module } from '@nestjs/common';
import { StaticController } from '@Controllers/static.controller';
import { jwtTokensRepositoryProvider, jwtTokensServiceProvider } from '@Modules/providers';
import { JwtService } from '@nestjs/jwt';

@Module({
	controllers: [StaticController],
	providers: [JwtService, jwtTokensServiceProvider, jwtTokensRepositoryProvider],
})
export class StaticModule {}
