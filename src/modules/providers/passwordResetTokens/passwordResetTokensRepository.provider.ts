import { CustomProviders } from '@Enums/CustomProviders.enum';
import { PasswordResetTokensRepository } from '@Repositories/passwordResetTokens.repository';

export const passwordResetTokensRepositoryProvider = {
	provide: CustomProviders.I_PASSWORD_RESET_TOKENS_REPOSITORY,
	useClass: PasswordResetTokensRepository,
};
