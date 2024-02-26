import { CustomProviders } from '@Enums/CustomProviders.enum';
import { PasswordResetTokensService } from '@Services/passwordResetTokens.service';

export const passwordResetTokensServiceProvider = {
	provide: CustomProviders.I_PASSWORD_RESET_TOKENS_SERVICE,
	useClass: PasswordResetTokensService,
};
