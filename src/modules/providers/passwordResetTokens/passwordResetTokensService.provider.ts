import { CustomProviders } from '@Enums/CustomProviders.enum';
import { PasswordResetTokensService } from '@Services/passwordResetTokens.service';
import { ClassProvider } from '@nestjs/common';

export const passwordResetTokensServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_PASSWORD_RESET_TOKENS_SERVICE,
	useClass: PasswordResetTokensService,
};
