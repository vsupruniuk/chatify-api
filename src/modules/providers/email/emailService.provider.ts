import { ClassProvider } from '@nestjs/common';

import { CustomProvider } from '@enums';

import { EmailService } from '@services';

export const emailServiceProvider: ClassProvider = {
	provide: CustomProvider.CTF_EMAIL_SERVICE,
	useClass: EmailService,
};
