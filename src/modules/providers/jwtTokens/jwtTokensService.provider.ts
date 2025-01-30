import { CustomProviders } from '@Enums/CustomProviders.enum';
import { JwtTokensService } from '@Services/jwtTokens.service';

export const jwtTokensServiceProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_SERVICE,
	useClass: JwtTokensService,
};
