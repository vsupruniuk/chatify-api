import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { JwtTokensService } from '@services';

export const jwtTokensServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_JWT_TOKENS_SERVICE,
	useClass: JwtTokensService,
};
