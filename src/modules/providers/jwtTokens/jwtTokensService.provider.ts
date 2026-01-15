import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { JwtTokensService } from '@services';

export const jwtTokensServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_JWT_TOKENS_SERVICE,
	useClass: JwtTokensService,
};
