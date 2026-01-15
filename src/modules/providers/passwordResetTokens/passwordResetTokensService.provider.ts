import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { PasswordResetTokensService } from '@services';

export const passwordResetTokensServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_PASSWORD_RESET_TOKENS_SERVICE,
	useClass: PasswordResetTokensService,
};
