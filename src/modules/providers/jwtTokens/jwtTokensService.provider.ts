import { CustomProviders } from '@Enums/CustomProviders.enum';
import { JwtTokensService } from '@Services/jwtTokens.service';
import { ClassProvider } from '@nestjs/common';

export const jwtTokensServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_SERVICE,
	useClass: JwtTokensService,
};
