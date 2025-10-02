import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { PasswordResetTokensService } from '@services';

export const passwordResetTokensServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE,
	useClass: PasswordResetTokensService,
};
