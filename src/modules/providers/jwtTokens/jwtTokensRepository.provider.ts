import { CustomProviders } from '@Enums/CustomProviders.enum';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';
import { ClassProvider } from '@nestjs/common';

export const jwtTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_REPOSITORY,
	useClass: JWTTokensRepository,
};
