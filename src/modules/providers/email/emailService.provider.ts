import { CustomProviders } from '@enums/CustomProviders.enum';
import { EmailService } from '@services/email/email.service';
import { ClassProvider } from '@nestjs/common';

export const emailServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_EMAIL_SERVICE,
	useClass: EmailService,
};
