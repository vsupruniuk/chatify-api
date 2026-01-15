import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { JwtTokensRepository } from '@repositories';

export const jwtTokensRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_JWT_TOKENS_REPOSITORY,
	useClass: JwtTokensRepository,
};
