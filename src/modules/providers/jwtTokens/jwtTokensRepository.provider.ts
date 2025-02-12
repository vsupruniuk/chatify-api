import { CustomProviders } from '@enums/CustomProviders.enum';
import { JWTTokensRepository } from '@repositories/JWTTokens.repository';
import { ClassProvider } from '@nestjs/common';

export const jwtTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_REPOSITORY,
	useClass: JWTTokensRepository,
};
