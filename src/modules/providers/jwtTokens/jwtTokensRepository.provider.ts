import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { JwtTokensRepository } from '@repositories';

export const jwtTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_REPOSITORY,
	useClass: JwtTokensRepository,
};
