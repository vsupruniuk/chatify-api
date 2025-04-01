import { CustomProviders } from '@enums/CustomProviders.enum';
import { JwtTokensRepository } from '@repositories/jwt/jwtTokens.repository';
import { ClassProvider } from '@nestjs/common';

export const jwtTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_REPOSITORY,
	useClass: JwtTokensRepository,
};
