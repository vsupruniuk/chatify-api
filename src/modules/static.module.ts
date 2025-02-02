import { Module } from '@nestjs/common';
import { StaticController } from '@Controllers/static.controller';
import { JwtService } from '@nestjs/jwt';
import providers from '@Modules/providers/providers';

@Module({
	controllers: [StaticController],
	providers: [JwtService, providers.CTF_JWT_TOKENS_SERVICE, providers.CTF_JWT_TOKENS_REPOSITORY],
})
export class StaticModule {}
