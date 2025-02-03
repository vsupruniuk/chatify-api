import { CustomProviders } from '@Enums/CustomProviders.enum';
import { EmailService } from '@Services/email.service';
import { ClassProvider } from '@nestjs/common';

export const emailServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_EMAIL_SERVICE,
	useClass: EmailService,
};
