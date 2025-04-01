import { Module } from '@nestjs/common';
import { SearchController } from '@controllers/search/search.controller';
import { JwtService } from '@nestjs/jwt';
import providers from '@modules/providers/providers';

@Module({
	controllers: [SearchController],
	providers: [
		JwtService,

		providers.CTF_JWT_TOKENS_SERVICE,
		providers.CTF_JWT_TOKENS_REPOSITORY,

		providers.CTF_USERS_SERVICE,
		providers.CTF_USERS_REPOSITORY,
	],
})
export class SearchModule {}
