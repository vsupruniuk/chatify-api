import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { PasswordResetTokensRepository } from '@repositories';

export const passwordResetTokensRepositoryProvider: ClassProvider = {
	provide: CustomProvider.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,
	useClass: PasswordResetTokensRepository,
};
