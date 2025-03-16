import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';
import { StaticController } from '@controllers/static/static.controller';

@Module({
	controllers: [StaticController],
	providers: [JwtService, providers.CTF_JWT_TOKENS_SERVICE, providers.CTF_JWT_TOKENS_REPOSITORY],
})
export class StaticModule {}
