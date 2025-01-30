import { CustomProviders } from '@Enums/CustomProviders.enum';
import { JWTTokensRepository } from '@Repositories/JWTTokens.repository';

export const jwtTokensRepositoryProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_REPOSITORY,
	useClass: JWTTokensRepository,
};
