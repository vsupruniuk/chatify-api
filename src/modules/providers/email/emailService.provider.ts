import { CustomProviders } from '@Enums/CustomProviders.enum';
import { EmailService } from '@Services/email.service';

export const emailServiceProvider = {
	provide: CustomProviders.I_EMAIL_SERVICE,
	useClass: EmailService,
};
