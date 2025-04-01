import { CustomProviders } from '@enums/CustomProviders.enum';
import { PasswordResetTokensRepository } from '@repositories/passwordResetToken/passwordResetTokens.repository';
import { ClassProvider } from '@nestjs/common';

export const passwordResetTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,
	useClass: PasswordResetTokensRepository,
};
