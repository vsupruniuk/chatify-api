import { CustomProviders } from '@Enums/CustomProviders.enum';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';
import { ClassProvider } from '@nestjs/common';

export const passwordResetTokensRepositoryProvider: ClassProvider = {
	provide: CustomProviders.CTF_PASSWORD_RESET_TOKENS_REPOSITORY,
	useClass: PasswordResetTokensRepository,
};
