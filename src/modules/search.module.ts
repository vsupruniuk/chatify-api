import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SearchController } from '@controllers';

import { providers } from '@modules/providers';

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
