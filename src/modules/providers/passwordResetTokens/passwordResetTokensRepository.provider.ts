import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { PasswordResetTokensRepository } from '@repositories';

export const passwordResetTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,
	useClass: PasswordResetTokensRepository,
};
