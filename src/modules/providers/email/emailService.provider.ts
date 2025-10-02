import { ClassProvider } from '@nestjs/common';

import { CustomProviders } from '@enums';

import { EmailService } from '@services';

export const emailServiceProvider: ClassProvider = {
	provide: CustomProviders.CTF_EMAIL_SERVICE,
	useClass: EmailService,
};
