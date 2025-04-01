import { CustomProviders } from '@enums/CustomProviders.enum';
import { JwtTokensService } from '@services/jwt/jwtTokens.service';
import { ClassProvider } from '@nestjs/common';

export const jwtTokensServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_SERVICE,
	useClass: JwtTokensService,
};
