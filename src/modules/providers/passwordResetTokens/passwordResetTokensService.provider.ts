import { CustomProviders } from '@enums/CustomProviders.enum';
import { PasswordResetTokensService } from '@services/passwordResetTokens.service';
import { ClassProvider } from '@nestjs/common';

export const passwordResetTokensServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE,
	useClass: PasswordResetTokensService,
};
